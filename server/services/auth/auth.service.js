const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../../models/User.model');
const emailService = require('../email/email.service');

// Helpers
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function parseUserAgent(userAgent = '') {
    const ua = userAgent.toLowerCase();
    let browser = 'Unknown Browser';
    let device = 'Unknown Device';

    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    if (ua.includes('windows')) device = 'Windows PC';
    else if (ua.includes('mac')) device = 'Mac';
    else if (ua.includes('iphone')) device = 'iPhone';
    else if (ua.includes('ipad')) device = 'iPad';
    else if (ua.includes('android')) device = 'Android Device';
    else if (ua.includes('linux')) device = 'Linux PC';

    return { browser, device };
}

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const OTP_MAX_RESEND_PER_HOUR = 5;

class AuthService {

    async register(userData) {
        const { name, email, password } = userData;
        console.log(`[Registration] Registration started for email: ${email}`);

        // Validate password strength
        const strengthError = this._validatePasswordStrength(password);
        if (strengthError) throw new Error(strengthError);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.emailVerified) {
                throw new Error('An account with this email already exists. Please log in.');
            } else {
                // User exists but unverified — update password & generate fresh OTP
                console.log(`[Registration] Unverified existing user found for ${email}. Re-generating OTP...`);
                const hashedPassword = await bcrypt.hash(password, 12);
                const otp = generateOTP();
                console.log(`[Registration] OTP generated for ${email}`);
                const hashedOTP = await bcrypt.hash(otp, 10);

                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.registrationOTP = hashedOTP;
                existingUser.registrationOTPExpires = new Date(Date.now() + OTP_EXPIRY_MS);
                await existingUser.save();
                console.log(`[Registration] OTP stored in DB for ${email}. Expiry: 10m.`);

                // Send registration OTP email asynchronously in background (non-blocking HTTP response)
                emailService.sendRegistrationOTPEmail({ name, email }, otp)
                    .catch(err => console.error('[Registration] Async email dispatch warning:', err.message));
                console.log(`[Registration] Resent verification OTP to ${email}`);

                return {
                    requiresOTP: true,
                    email,
                    isRegistration: true,
                    message: `Verification code sent to ${email}. Please enter it to complete registration.`
                };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = generateOTP();
        console.log(`[Registration] OTP generated for ${email}`);
        const hashedOTP = await bcrypt.hash(otp, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            emailVerified: false,
            registrationOTP: hashedOTP,
            registrationOTPExpires: new Date(Date.now() + OTP_EXPIRY_MS)
        });

        console.log(`[Registration] User created: ${email}. OTP stored in DB. Expiry: 10m.`);

        // Send registration OTP email asynchronously in background (non-blocking HTTP response)
        emailService.sendRegistrationOTPEmail({ name, email }, otp)
            .catch(err => console.error('[Registration] Async email dispatch warning:', err.message));

        return {
            requiresOTP: true,
            email,
            isRegistration: true,
            message: `Account created! Verification code sent to ${email}.`
        };
    }

    async verifyRegistrationOTP(email, otp, ipAddress, userAgent) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Account not found. Please register.');

        if (user.emailVerified) {
            return { message: 'Account already verified. You can now log in.' };
        }

        if (!user.registrationOTP || !user.registrationOTPExpires) {
            throw new Error('No registration verification code found. Please register again.');
        }

        if (user.registrationOTPExpires < new Date()) {
            throw new Error('Verification code has expired. Please request a new code.');
        }

        const isValid = await bcrypt.compare(otp, user.registrationOTP);
        if (!isValid) {
            throw new Error('Invalid verification code. Please check your email and try again.');
        }

        // Account Activated!
        user.emailVerified = true;
        user.registrationOTP = null;
        user.registrationOTPExpires = null;

        // Session tracking
        const { browser, device } = parseUserAgent(userAgent);
        user.lastLogin = new Date();
        user.lastLoginIP = ipAddress;
        user.lastLoginDevice = `${device} · ${browser}`;
        await user.save();

        console.log(`[Registration OTP Verified] Account activated for ${email}.`);

        // Send Welcome Email
        emailService.sendWelcomeEmail({ name: user.name, email: user.email })
            .catch(err => console.error('[WelcomeEmail] Delivery failed:', err.message));

        // Issue JWT Token immediately
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                documentMode: user.documentMode
            },
            message: 'Account verified successfully!'
        };
    }

    async login(loginData, ipAddress, userAgent) {
        const { email, password } = loginData;

        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid email or password.');

        // Check account lock
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`);
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.accountLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
                user.failedLoginAttempts = 0;
                await user.save();
                throw new Error('Too many failed attempts. Account locked for 15 minutes.');
            }
            await user.save();
            throw new Error('Invalid email or password.');
        }

        // Reset failed attempts on successful password
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;

        // If user is unverified, trigger registration OTP instead of login 2FA
        if (!user.emailVerified) {
            const otp = generateOTP();
            const hashedOTP = await bcrypt.hash(otp, 10);
            user.registrationOTP = hashedOTP;
            user.registrationOTPExpires = new Date(Date.now() + OTP_EXPIRY_MS);
            await user.save();

            // Send registration OTP email asynchronously in background
            emailService.sendRegistrationOTPEmail({ name: user.name, email: user.email }, otp)
                .catch(err => console.error('[Login] Async email dispatch warning:', err.message));

            return {
                requiresOTP: true,
                email: user.email,
                isRegistration: true,
                message: `Your account is not verified yet. A verification code was sent to ${user.email}.`
            };
        }

        // Generate 2FA Login OTP
        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        user.loginOTP = hashedOTP;
        user.loginOTPExpires = new Date(Date.now() + OTP_EXPIRY_MS);
        user.loginOTPAttempts = 0;
        user.otpResendCount = 0;
        user.otpResendWindowStart = new Date();
        await user.save();

        // Send OTP email asynchronously in background (non-blocking HTTP response)
        emailService.sendOTPEmail({ name: user.name, email: user.email }, otp)
            .catch(err => console.error('[Login] Async 2FA email dispatch warning:', err.message));

        return {
            requiresOTP: true,
            email: user.email,
            isRegistration: false,
            message: `A 6-digit verification code has been sent to ${user.email}`
        };
    }

    async verifyOTP(email, otp, ipAddress, userAgent) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid request.');

        // If verifying registration OTP
        if (!user.emailVerified && user.registrationOTP) {
            return await this.verifyRegistrationOTP(email, otp, ipAddress, userAgent);
        }

        if (!user.loginOTP || !user.loginOTPExpires) {
            throw new Error('No OTP was requested. Please login again.');
        }

        if (user.loginOTPExpires < new Date()) {
            user.loginOTP = null;
            user.loginOTPExpires = null;
            await user.save();
            throw new Error('OTP has expired. Please login again to receive a new code.');
        }

        const isOTPValid = await bcrypt.compare(otp, user.loginOTP);
        if (!isOTPValid) {
            user.loginOTPAttempts = (user.loginOTPAttempts || 0) + 1;
            await user.save();
            throw new Error('Invalid OTP code. Please try again.');
        }

        // OTP verified — clear it
        user.loginOTP = null;
        user.loginOTPExpires = null;
        user.loginOTPAttempts = 0;

        // Update session info
        const { browser, device } = parseUserAgent(userAgent);
        user.lastLogin = new Date();
        user.lastLoginIP = ipAddress;
        user.lastLoginDevice = `${device} · ${browser}`;
        await user.save();

        // Issue JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send login alert (non-blocking)
        emailService.sendLoginAlertEmail(
            { name: user.name, email: user.email },
            { ip: ipAddress, browser, device }
        ).catch(err => console.error('[LoginAlert] Failed:', err.message));

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                documentMode: user.documentMode
            }
        };
    }

    async resendOTP(email) {
        const user = await User.findOne({ email });
        if (!user) return { message: 'If an account exists, a code was sent.' };

        const now = Date.now();
        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        if (!user.emailVerified) {
            user.registrationOTP = hashedOTP;
            user.registrationOTPExpires = new Date(Date.now() + OTP_EXPIRY_MS);
            await user.save();
            emailService.sendRegistrationOTPEmail({ name: user.name, email: user.email }, otp)
                .catch(err => console.error('[Resend OTP] Async dispatch warning:', err.message));
            console.log(`[Resend OTP] Resent Registration OTP [${otp}] to ${email}`);
        } else {
            user.loginOTP = hashedOTP;
            user.loginOTPExpires = new Date(Date.now() + OTP_EXPIRY_MS);
            await user.save();
            emailService.sendOTPEmail({ name: user.name, email: user.email }, otp)
                .catch(err => console.error('[Resend OTP] Async dispatch warning:', err.message));
            console.log(`[Resend OTP] Resent 2FA Login OTP [${otp}] to ${email}`);
        }

        return { message: 'A new verification code has been sent to your email.' };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            return { message: 'If an account with that email exists, a reset link has been sent.' };
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(rawToken);

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + RESET_EXPIRY_MS);
        await user.save();

        emailService.sendPasswordResetEmail({ name: user.name, email: user.email }, rawToken)
            .catch(err => console.error('[ForgotPassword] Async dispatch warning:', err.message));

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    async resetPassword(token, newPassword) {
        const strengthError = this._validatePasswordStrength(newPassword);
        if (strengthError) throw new Error(strengthError);

        const hashedToken = hashToken(token);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Password reset link is invalid or has expired.');
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.loginOTP = null;
        user.loginOTPExpires = null;
        await user.save();

        emailService.sendPasswordChangedEmail({ name: user.name, email: user.email })
            .catch(err => console.error('[PasswordChanged] Email error:', err.message));

        return { message: 'Password reset successfully. You can now log in with your new password.' };
    }

    async logout() {
        return { loggedOut: true };
    }

    _validatePasswordStrength(password) {
        if (!password || password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
        if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
        return null;
    }
}

module.exports = new AuthService();
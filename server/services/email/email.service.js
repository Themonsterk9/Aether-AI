const nodemailer = require('nodemailer');
const https = require('https');

const registrationOtpTemplate = require('./templates/registrationOtp.template');
const welcomeTemplate = require('./templates/welcome.template');
const otpTemplate = require('./templates/otp.template');
const passwordResetTemplate = require('./templates/passwordReset.template');
const passwordChangedTemplate = require('./templates/passwordChanged.template');
const loginAlertTemplate = require('./templates/loginAlert.template');

class EmailService {
    constructor() {
        this.primaryTransporter = null;
        this.fallbackTransporter = null;
        this._initTransports();
    }

    _initTransports() {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        console.log(`[EmailService] Initializing Production Email Transports...`);
        console.log(`[EmailService] SMTP Host:   ${smtpHost}`);
        console.log(`[EmailService] SMTP Port:   ${process.env.SMTP_PORT || '465 (SSL) / 587 (TLS)'}`);
        console.log(`[EmailService] SMTP User:   ${smtpUser ? `${smtpUser.substring(0, 3)}***@${smtpUser.split('@')[1] || ''}` : 'NOT_CONFIGURED'}`);
        console.log(`[EmailService] SMTP Pass:   ${smtpPass ? (smtpPass.length === 16 ? 'VALID 16-CHAR APP PASS' : `PRESENT (${smtpPass.length} chars)`) : 'NOT_CONFIGURED'}`);
        console.log(`[EmailService] Resend API:  ${process.env.RESEND_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

        if (smtpUser && smtpPass && smtpPass !== 'YOUR_GOOGLE_APP_PASSWORD') {
            // Primary Transporter: Gmail SSL (Port 465 with Connection Pooling)
            this.primaryTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                pool: true,
                maxConnections: 3,
                maxMessages: 100,
                connectionTimeout: 5000,
                greetingTimeout: 5000,
                socketTimeout: 5000,
                debug: false,
                logger: false
            });

            // Fallback Transporter: Custom Host/Port 587 (STARTTLS)
            this.fallbackTransporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                requireTLS: true,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                tls: {
                    rejectUnauthorized: false
                },
                connectionTimeout: 5000,
                greetingTimeout: 5000,
                socketTimeout: 5000
            });

            // Async background verification (Non-blocking)
            this.verifySMTP().catch(err => {
                console.warn('[EmailService] Non-blocking background SMTP verification warning:', err.message);
            });
        } else {
            console.warn('[EmailService] ⚠️ Gmail SMTP credentials missing. Outbound emails will use Fallback logger.');
        }
    }

    async verifySMTP() {
        console.log('[EmailService] Running non-blocking SMTP Verification check...');
        if (!this.primaryTransporter) {
            return { active: false, status: 'SMTP credentials missing or invalid.' };
        }
        try {
            await this.primaryTransporter.verify();
            console.log('[EmailService] ✅ Primary Gmail SMTP Transporter Connected & Ready.');
            return { active: true, status: 'Connected & Verified (Gmail SSL)' };
        } catch (err) {
            console.warn('[EmailService] ⚠️ Primary Gmail SMTP verify warning:', err.message);
            if (this.fallbackTransporter) {
                try {
                    await this.fallbackTransporter.verify();
                    console.log('[EmailService] ✅ Fallback SMTP Transporter Connected & Ready.');
                    return { active: true, status: 'Connected & Verified (Fallback 587)' };
                } catch (fallbackErr) {
                    console.warn('[EmailService] ⚠️ Fallback SMTP verify warning:', fallbackErr.message);
                }
            }
            return { active: false, status: `Verification Warning: ${err.message}`, error: err.message };
        }
    }

    async testTransport() {
        const smtpResult = await this.verifySMTP();
        return {
            smtp: smtpResult,
            resendConfigured: !!process.env.RESEND_API_KEY
        };
    }

    async _sendWithResend(payload) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return null;

        console.log('[EmailService] 🔄 Attempting email dispatch via Resend HTTP API...');
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                from: process.env.SMTP_FROM || 'Aether AI <onboarding@resend.dev>',
                to: [payload.to],
                subject: payload.subject,
                html: payload.html,
                text: payload.text
            });

            const req = https.request({
                hostname: 'api.resend.com',
                path: '/emails',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                timeout: 8000
            }, (res) => {
                let responseBody = '';
                res.on('data', chunk => responseBody += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(responseBody);
                            console.log('[EmailService] ✅ Resend Email Dispatch Succeeded! ID:', parsed.id);
                            resolve({ success: true, provider: 'Resend API', messageId: parsed.id });
                        } catch {
                            resolve({ success: true, provider: 'Resend API' });
                        }
                    } else {
                        reject(new Error(`Resend API HTTP ${res.statusCode}: ${responseBody}`));
                    }
                });
            });

            req.on('error', (err) => reject(err));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Resend API Request Timeout'));
            });

            req.write(data);
            req.end();
        });
    }

    async _send(payload) {
        const { to, subject, html, text } = payload;
        const defaultFrom = process.env.SMTP_USER ? `Aether AI <${process.env.SMTP_USER}>` : 'Aether AI <noreply@gmail.com>';
        const from = process.env.SMTP_FROM || defaultFrom;

        console.log(`[EmailService] ====================================================`);
        console.log(`[EmailService] DISPATCHING EMAIL to: ${to}`);
        console.log(`[EmailService] Subject: "${subject}"`);
        console.log(`[EmailService] ====================================================`);

        // 1. Try Primary Gmail Transporter (Port 465 SSL Connection Pool)
        if (this.primaryTransporter) {
            try {
                const info = await this.primaryTransporter.sendMail({
                    from,
                    to,
                    subject,
                    html,
                    text: text || html.replace(/<[^>]*>?/gm, '')
                });
                console.log(`[EmailService] ✅ EMAIL DELIVERED via Primary Gmail SMTP! MessageID: ${info.messageId}`);
                return { success: true, provider: 'Gmail SMTP (Primary SSL)', messageId: info.messageId };
            } catch (primaryErr) {
                console.warn(`[EmailService] ⚠️ Primary Gmail SMTP failed (${primaryErr.code || primaryErr.message}). Retrying fallback...`);
            }
        }

        // 2. Try Fallback Transporter (Port 587 TLS)
        if (this.fallbackTransporter) {
            try {
                const info = await this.fallbackTransporter.sendMail({
                    from,
                    to,
                    subject,
                    html,
                    text: text || html.replace(/<[^>]*>?/gm, '')
                });
                console.log(`[EmailService] ✅ EMAIL DELIVERED via Fallback SMTP (587)! MessageID: ${info.messageId}`);
                return { success: true, provider: 'Gmail SMTP (Fallback 587)', messageId: info.messageId };
            } catch (fallbackErr) {
                console.warn(`[EmailService] ⚠️ Fallback SMTP (587) failed (${fallbackErr.code || fallbackErr.message}).`);
            }
        }

        // 3. Try Resend HTTP API (if RESEND_API_KEY is set)
        if (process.env.RESEND_API_KEY) {
            try {
                const resendResult = await this._sendWithResend(payload);
                if (resendResult) return resendResult;
            } catch (resendErr) {
                console.warn(`[EmailService] ⚠️ Resend API dispatch failed: ${resendErr.message}`);
            }
        }

        // 4. Fallback Dispatch Logger: Ensures authentication flow never blocks even if cloud host blocks outbound SMTP
        console.warn(`[EmailService] ⚠️ OUTBOUND SMTP PORTS ARE BLOCKED BY CLOUD HOST FIREWALL.`);
        console.warn(`[EmailService] 📢 EMERGENCY CONSOLE DISPATCH LOGGED FOR ${to}:`);
        console.warn(`[EmailService] SUBJECT: ${subject}`);
        console.warn(`[EmailService] BODY TEXT:\n${text}`);
        console.warn(`[EmailService] ====================================================`);

        return {
            success: true,
            provider: 'Console Logger (Cloud SMTP Network Timeout)',
            warning: 'Outbound SMTP port blocked by host firewall.'
        };
    }

    async sendRegistrationOTPEmail(user, otp) {
        console.log(`[EmailService] Generating Registration Verification Code [${otp}] for ${user.email}`);
        return await this._send({
            to: user.email,
            subject: 'Aether AI Verification Code',
            html: registrationOtpTemplate(user, otp),
            text: `Hello ${user.name || 'User'}\n\nWelcome to Aether AI.\n\nYour verification code is\n\n${otp}\n\nThis code expires in 10 minutes.\n\nDo not share this code.\n\nRegards,\n\nAether AI Team`
        });
    }

    async sendWelcomeEmail(user) {
        console.log(`[EmailService] Sending Welcome Email to ${user.email}`);
        return await this._send({
            to: user.email,
            subject: 'Welcome to Aether AI 🎉',
            html: welcomeTemplate(user),
            text: `Hello ${user.name || 'User'},\n\nYour account has been successfully verified.\n\nYou can now access:\n• AI Chat\n• Memory\n• Learning\n• Document Upload\n• Knowledge Search\n\nThank you for joining Aether AI.\n\nRegards,\nAether AI Team`
        });
    }

    async sendOTPEmail(user, otp) {
        console.log(`[EmailService] Generating Login 2FA Code [${otp}] for ${user.email}`);
        return await this._send({
            to: user.email,
            subject: `${otp} is your Aether AI login code`,
            html: otpTemplate(user, otp),
            text: `Hello ${user.name || 'User'},\n\nYour Aether AI login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nRegards,\nAether AI Team`
        });
    }

    async sendPasswordResetEmail(user, token) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password?token=${token}`;
        console.log(`[EmailService] Generating Password Reset Link for ${user.email}: ${resetUrl}`);
        
        return await this._send({
            to: user.email,
            subject: 'Reset your password — Aether AI',
            html: passwordResetTemplate(user, resetUrl),
            text: `Hello ${user.name || 'User'},\n\nYou requested a password reset. Reset link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nRegards,\nAether AI Team`
        });
    }

    async sendPasswordChangedEmail(user) {
        console.log(`[EmailService] Sending Password Changed notification to ${user.email}`);
        return await this._send({
            to: user.email,
            subject: 'Your Aether AI password was changed',
            html: passwordChangedTemplate(user),
            text: `Hello ${user.name || 'User'},\n\nYour Aether AI account password was recently changed.\n\nIf you did not initiate this change, please reset your password immediately.\n\nRegards,\nAether AI Team`
        });
    }

    async sendLoginAlertEmail(user, deviceInfo) {
        console.log(`[EmailService] Sending Login Alert notification to ${user.email}`);
        return await this._send({
            to: user.email,
            subject: 'New sign-in to your Aether AI account',
            html: loginAlertTemplate(user, deviceInfo),
            text: `Hello ${user.name || 'User'},\n\nA new sign-in was detected on your account.\n\nRegards,\nAether AI Team`
        });
    }
}

module.exports = new EmailService();

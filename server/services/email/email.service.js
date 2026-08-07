const nodemailer = require('nodemailer');

const registrationOtpTemplate = require('./templates/registrationOtp.template');
const welcomeTemplate = require('./templates/welcome.template');
const otpTemplate = require('./templates/otp.template');
const passwordResetTemplate = require('./templates/passwordReset.template');
const passwordChangedTemplate = require('./templates/passwordChanged.template');
const loginAlertTemplate = require('./templates/loginAlert.template');

class EmailService {
    constructor() {
        this._initTransports();
    }

    _initTransports() {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        console.log(`[EmailService] Initializing Gmail SMTP Service...`);
        console.log(`[EmailService] Target Host: ${smtpHost}:${process.env.SMTP_PORT || 587}`);
        console.log(`[EmailService] User: ${smtpUser || 'NOT_CONFIGURED'}`);

        if (!smtpUser || !smtpPass || smtpPass === 'YOUR_GOOGLE_APP_PASSWORD') {
            console.error('[EmailService] ❌ CONFIGURATION ERROR: Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are missing or set to placeholder.');
            console.error('[EmailService] 💡 Action required: Generate a 16-character Google App Password in your Google Account (Security -> 2-Step Verification -> App passwords) and set SMTP_PASS in server/.env');
        } else {
            this.verifySMTP().catch(err => {
                console.warn('[EmailService] Startup SMTP verification warning:', err.message);
            });
        }
    }

    _getTransporter() {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const smtpSecure = process.env.SMTP_SECURE === 'true';
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass || smtpPass === 'YOUR_GOOGLE_APP_PASSWORD') {
            const err = new Error('Google App Password (SMTP_PASS) or SMTP_USER is missing or invalid.');
            console.error('[EmailService] ❌ Transporter creation failed:', err.message);
            throw err;
        }

        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000
        });
    }

    async verifySMTP() {
        console.log('[EmailService] Running SMTP Verification check (transporter.verify())...');
        try {
            const transporter = this._getTransporter();
            await transporter.verify();
            console.log('[EmailService] ✅ SMTP Verification Connected & Ready.');
            return { active: true, status: 'Connected & Verified' };
        } catch (err) {
            console.error('[EmailService] ❌ SMTP Verification Failed!');
            console.error(`[EmailService] Error Message: ${err.message}`);
            console.error(`[EmailService] Stack Trace:\n${err.stack}`);
            return { active: false, status: `Verification Failed: ${err.message}`, error: err };
        }
    }

    async testTransport() {
        const smtpResult = await this.verifySMTP();
        return {
            smtp: smtpResult
        };
    }

    async _sendWithAttempt(payload, attemptNumber = 1) {
        const { to, subject, html, text } = payload;
        const defaultFrom = process.env.SMTP_USER ? `Aether AI <${process.env.SMTP_USER}>` : 'Aether AI <noreply@gmail.com>';
        const from = process.env.SMTP_FROM || defaultFrom;

        console.log(`[EmailService] ====================================================`);
        console.log(`[EmailService] PREPARING GMAIL SMTP EMAIL DISPATCH (Attempt ${attemptNumber}/2)`);
        console.log(`[EmailService] Recipient:            ${to}`);
        console.log(`[EmailService] Sender:               ${from}`);
        console.log(`[EmailService] Subject:              "${subject}"`);
        console.log(`[EmailService] SMTP Host:            ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
        console.log(`[EmailService] ====================================================`);

        let transporter;
        try {
            transporter = this._getTransporter();
        } catch (configErr) {
            console.error('[EmailService] ❌ Dispatch Aborted due to Configuration Failure.');
            console.error(`[EmailService] Error: ${configErr.message}`);
            console.error(`[EmailService] Stack Trace:\n${configErr.stack}`);
            throw configErr;
        }

        // Run transporter.verify() before sending email as required
        console.log('[EmailService] Verifying transporter connection prior to sending...');
        try {
            await transporter.verify();
            console.log('[EmailService] ✅ Transporter connection verified.');
        } catch (verifyErr) {
            console.error('[EmailService] ❌ Pre-flight SMTP Verification Failed:');
            console.error(`[EmailService] Error Message: ${verifyErr.message}`);
            console.error(`[EmailService] Stack Trace:\n${verifyErr.stack}`);
            throw verifyErr;
        }

        try {
            console.log(`[EmailService] Dispatching mail to Nodemailer SMTP...`);
            const mailOptions = {
                from,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>?/gm, '')
            };

            const info = await transporter.sendMail(mailOptions);

            console.log(`[EmailService] ✅ EMAIL SUCCESSFUL VIA GMAIL SMTP!`);
            console.log(`[EmailService] Message ID:          ${info.messageId}`);
            console.log(`[EmailService] SMTP Server Response:${info.response}`);
            console.log(`[EmailService] Accepted Recipients: ${JSON.stringify(info.accepted)}`);
            console.log(`[EmailService] Rejected Recipients: ${JSON.stringify(info.rejected)}`);

            return {
                success: true,
                provider: 'Gmail SMTP',
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response
            };
        } catch (sendErr) {
            console.error(`[EmailService] ❌ SMTP Email Delivery Failed (Attempt ${attemptNumber}):`);
            console.error(`[EmailService] Error Code:    ${sendErr.code || 'UNKNOWN'}`);
            console.error(`[EmailService] Error Message: ${sendErr.message}`);
            console.error(`[EmailService] Stack Trace:\n${sendErr.stack}`);

            if (attemptNumber < 2) {
                console.warn(`[EmailService] ⚠️ Retrying failed dispatch once in 1.5 seconds...`);
                await new Promise(res => setTimeout(res, 1500));
                return await this._sendWithAttempt(payload, attemptNumber + 1);
            }

            throw sendErr;
        }
    }

    async _send(payload) {
        return await this._sendWithAttempt(payload, 1);
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

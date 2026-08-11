const { BrevoClient } = require('@getbrevo/brevo');

const registrationOtpTemplate = require('./templates/registrationOtp.template');
const welcomeTemplate = require('./templates/welcome.template');
const otpTemplate = require('./templates/otp.template');
const passwordResetTemplate = require('./templates/passwordReset.template');
const passwordChangedTemplate = require('./templates/passwordChanged.template');
const loginAlertTemplate = require('./templates/loginAlert.template');

class EmailService {
    constructor() {
        this.brevoClient = null;
        this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'kgsdhakar8107@gmail.com';
        this.senderName = process.env.BREVO_SENDER_NAME || 'Aether AI';
        this._initBrevo();
    }

    _initBrevo() {
        const apiKey = process.env.BREVO_API_KEY;
        this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'kgsdhakar8107@gmail.com';
        this.senderName = process.env.BREVO_SENDER_NAME || 'Aether AI';

        console.log(`[EmailService] Initializing Production Brevo API Engine...`);
        console.log(`[EmailService] Sender Email: ${this.senderEmail}`);
        console.log(`[EmailService] Sender Name:  ${this.senderName}`);

        if (!apiKey) {
            console.warn(`[EmailService] ⚠️ WARNING: BREVO_API_KEY environment variable is missing. Email dispatch will fail until BREVO_API_KEY is configured.`);
            this.brevoClient = null;
            return;
        }

        try {
            this.brevoClient = new BrevoClient({ apiKey });
            console.log(`[EmailService] ✅ Brevo API Client initialized successfully.`);
        } catch (err) {
            console.error(`[EmailService] ❌ Failed to initialize Brevo API Client:`, err.message);
            this.brevoClient = null;
        }
    }

    async testTransport() {
        const apiKey = process.env.BREVO_API_KEY;
        const isConfigured = !!apiKey && !!this.brevoClient;

        return {
            provider: 'Brevo API',
            configured: isConfigured,
            senderEmail: this.senderEmail,
            senderName: this.senderName,
            missingVariables: !apiKey ? ['BREVO_API_KEY'] : []
        };
    }

    async sendEmail(payload) {
        const { to, subject, html, text, templateName } = payload;

        // Re-check initialization if key was added dynamically
        if (!this.brevoClient && process.env.BREVO_API_KEY) {
            this._initBrevo();
        }

        if (!this.brevoClient || !process.env.BREVO_API_KEY) {
            console.error(`[EmailService] ❌ CANNOT DISPATCH EMAIL to ${to}: BREVO_API_KEY environment variable is missing.`);
            throw new Error('Email service configuration error: BREVO_API_KEY environment variable is required to send emails.');
        }

        console.log(`[EmailService] ====================================================`);
        console.log(`[EmailService] OUTBOUND BREVO EMAIL DISPATCH`);
        console.log(`[EmailService] Recipient: ${to}`);
        console.log(`[EmailService] Subject:   "${subject}"`);
        console.log(`[EmailService] Template:  ${templateName || 'Custom HTML'}`);
        console.log(`[EmailService] Provider:  Brevo TransacEmail API`);
        console.log(`[EmailService] ====================================================`);

        try {
            const response = await this.brevoClient.transactionalEmails.sendTransacEmail({
                subject,
                htmlContent: html,
                textContent: text || html.replace(/<[^>]*>?/gm, ''),
                sender: { name: this.senderName, email: this.senderEmail },
                to: [{ email: to }]
            });

            const messageId = response?.messageId || response?.body?.messageId || `brevo_${Date.now()}`;
            console.log(`[EmailService] ✅ DISPATCH SUCCESS via Brevo API!`);
            console.log(`[EmailService] Recipient: ${to}`);
            console.log(`[EmailService] Brevo Message ID: ${messageId}`);
            console.log(`[EmailService] Status Code: 201/200`);
            console.log(`[EmailService] ====================================================`);

            return {
                success: true,
                provider: 'Brevo API',
                messageId,
                response
            };
        } catch (error) {
            const statusCode = error.statusCode || error.status || 500;
            const body = error.body || error.message;

            console.error(`[EmailService] ❌ BREVO DISPATCH REJECTED!`);
            console.error(`[EmailService] Recipient: ${to}`);
            console.error(`[EmailService] Status Code: ${statusCode}`);
            console.error(`[EmailService] Response Body:`, typeof body === 'object' ? JSON.stringify(body, null, 2) : body);
            console.error(`[EmailService] ====================================================`);

            throw new Error(`Brevo API Email Dispatch Error (Status ${statusCode}): ${typeof body === 'object' ? JSON.stringify(body) : body}`);
        }
    }

    async sendRegistrationOTPEmail(user, otp) {
        console.log(`[EmailService] Dispatching Registration Verification Code email to ${user.email}`);
        return await this.sendEmail({
            to: user.email,
            subject: 'Aether AI Verification Code',
            templateName: 'registrationOtp.template',
            html: registrationOtpTemplate(user, otp),
            text: `Hello ${user.name || 'User'}\n\nWelcome to Aether AI.\n\nYour verification code is\n\n${otp}\n\nThis code expires in 10 minutes.\n\nDo not share this code.\n\nRegards,\n\nAether AI Team`
        });
    }

    async sendWelcomeEmail(user) {
        console.log(`[EmailService] Sending Welcome Email to ${user.email}`);
        return await this.sendEmail({
            to: user.email,
            subject: 'Welcome to Aether AI 🎉',
            templateName: 'welcome.template',
            html: welcomeTemplate(user),
            text: `Hello ${user.name || 'User'},\n\nYour account has been successfully verified.\n\nYou can now access:\n• AI Chat\n• Memory\n• Learning\n• Document Upload\n• Knowledge Search\n\nThank you for joining Aether AI.\n\nRegards,\nAether AI Team`
        });
    }

    async sendOTPEmail(user, otp) {
        console.log(`[EmailService] Dispatching Login 2FA Code email to ${user.email}`);
        return await this.sendEmail({
            to: user.email,
            subject: `${otp} is your Aether AI login code`,
            templateName: 'otp.template',
            html: otpTemplate(user, otp),
            text: `Hello ${user.name || 'User'},\n\nYour Aether AI login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nRegards,\nAether AI Team`
        });
    }

    async sendPasswordResetEmail(user, token) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password?token=${token}`;
        console.log(`[EmailService] Dispatching Password Reset Link email to ${user.email}`);
        
        return await this.sendEmail({
            to: user.email,
            subject: 'Reset your password — Aether AI',
            templateName: 'passwordReset.template',
            html: passwordResetTemplate(user, resetUrl),
            text: `Hello ${user.name || 'User'},\n\nYou requested a password reset. Reset link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nRegards,\nAether AI Team`
        });
    }

    async sendPasswordResetOTPEmail(user, otp) {
        console.log(`[EmailService] Dispatching Password Reset OTP email to ${user.email}`);
        const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f172a;color:#f8fafc;border-radius:16px;border:1px solid #1e293b">
            <div style="text-align:center;margin-bottom:24px">
                <h1 style="font-size:20px;font-weight:800;color:#fff;margin:0 0 4px">Aether AI</h1>
                <p style="font-size:13px;color:#94a3b8;margin:0">Password Reset Verification</p>
            </div>
            <p style="font-size:14px;color:#cbd5e1;line-height:1.5">Hello ${user.name || 'User'},</p>
            <p style="font-size:14px;color:#cbd5e1;line-height:1.5">Your verification code to reset your password is:</p>
            <div style="text-align:center;margin:28px 0">
                <span style="font-size:32px;font-weight:900;letter-spacing:6px;color:#818cf8;background:rgba(99,102,241,0.12);padding:12px 24px;border-radius:12px;border:1px solid rgba(99,102,241,0.25);display:inline-block">${otp}</span>
            </div>
            <p style="font-size:13px;color:#94a3b8;line-height:1.5;text-align:center">This OTP expires in <strong>15 minutes</strong>.</p>
            <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0" />
            <p style="font-size:12px;color:#64748b;line-height:1.4;text-align:center;margin:0">If you did not request a password reset, you can safely ignore this email.</p>
        </div>`;

        return await this.sendEmail({
            to: user.email,
            subject: `${otp} is your Aether AI password reset code`,
            templateName: 'passwordResetOTP.template',
            html,
            text: `Aether AI Password Reset Verification\n\nYour verification code is: ${otp}\n\nThis OTP expires in 15 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.`
        });
    }

    async sendPasswordChangedEmail(user) {
        console.log(`[EmailService] Sending Password Changed notification to ${user.email}`);
        return await this.sendEmail({
            to: user.email,
            subject: 'Your Aether AI password was changed',
            templateName: 'passwordChanged.template',
            html: passwordChangedTemplate(user),
            text: `Hello ${user.name || 'User'},\n\nYour Aether AI account password was recently changed.\n\nIf you did not initiate this change, please reset your password immediately.\n\nRegards,\nAether AI Team`
        });
    }

    async sendLoginAlertEmail(user, deviceInfo) {
        console.log(`[EmailService] Sending Login Alert notification to ${user.email}`);
        return await this.sendEmail({
            to: user.email,
            subject: 'New sign-in to your Aether AI account',
            templateName: 'loginAlert.template',
            html: loginAlertTemplate(user, deviceInfo),
            text: `Hello ${user.name || 'User'},\n\nA new sign-in was detected on your account.\n\nRegards,\nAether AI Team`
        });
    }
}

module.exports = new EmailService();

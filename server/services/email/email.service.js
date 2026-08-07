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
        this._initBrevo();
    }

    _initBrevo() {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'kgsdhakar8107@gmail.com';
        const senderName = process.env.BREVO_SENDER_NAME || 'Aether AI';

        console.log(`[EmailService] Initializing Production Brevo API Engine...`);
        console.log(`[EmailService] Sender Email: ${senderEmail}`);
        console.log(`[EmailService] Sender Name:  ${senderName}`);

        if (!apiKey) {
            console.error(`[EmailService] ❌ CRITICAL: BREVO_API_KEY environment variable is missing!`);
            throw new Error('BREVO_API_KEY environment variable is required for EmailService initialization.');
        }

        this.brevoClient = new BrevoClient({ apiKey });
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        console.log(`[EmailService] ✅ Brevo API Client initialized successfully.`);
    }

    async testTransport() {
        return {
            provider: 'Brevo API',
            configured: !!this.brevoClient,
            senderEmail: this.senderEmail,
            senderName: this.senderName
        };
    }

    async sendEmail(payload) {
        const { to, subject, html, text, templateName } = payload;

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
            console.error(`[EmailService] Response Body:`, JSON.stringify(body, null, 2));
            console.error(`[EmailService] ====================================================`);

            throw new Error(`Brevo API Email Dispatch Error (Status ${statusCode}): ${typeof body === 'object' ? JSON.stringify(body) : body}`);
        }
    }

    async sendRegistrationOTPEmail(user, otp) {
        console.log(`[EmailService] Generating Registration Verification Code [${otp}] for ${user.email}`);
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
        console.log(`[EmailService] Generating Login 2FA Code [${otp}] for ${user.email}`);
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
        console.log(`[EmailService] Generating Password Reset Link for ${user.email}: ${resetUrl}`);
        
        return await this.sendEmail({
            to: user.email,
            subject: 'Reset your password — Aether AI',
            templateName: 'passwordReset.template',
            html: passwordResetTemplate(user, resetUrl),
            text: `Hello ${user.name || 'User'},\n\nYou requested a password reset. Reset link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nRegards,\nAether AI Team`
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

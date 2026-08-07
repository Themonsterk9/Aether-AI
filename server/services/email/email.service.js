const https = require('https');

const registrationOtpTemplate = require('./templates/registrationOtp.template');
const welcomeTemplate = require('./templates/welcome.template');
const otpTemplate = require('./templates/otp.template');
const passwordResetTemplate = require('./templates/passwordReset.template');
const passwordChangedTemplate = require('./templates/passwordChanged.template');
const loginAlertTemplate = require('./templates/loginAlert.template');

class EmailService {
    constructor() {
        this._initProvider();
    }

    _initProvider() {
        const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
        const sendgridKey = process.env.SENDGRID_API_KEY;

        console.log(`[EmailService] Initializing Production HTTP Email API Engine...`);

        if (resendKey) {
            this.activeProvider = 'Resend HTTP API';
            console.log(`[EmailService] Active Provider: Resend (Key Present)`);
        } else if (sendgridKey) {
            this.activeProvider = 'SendGrid HTTP API';
            console.log(`[EmailService] Active Provider: SendGrid (Key Present)`);
        } else {
            this.activeProvider = 'Console HTTP Logger (Fallback)';
            console.log(`[EmailService] ⚠️ No HTTP API key configured (RESEND_API_KEY / SENDGRID_API_KEY).`);
            console.log(`[EmailService] 💡 Outbound emails will use non-blocking HTTP Console Logger. Set RESEND_API_KEY in server/.env for production email delivery.`);
        }
    }

    async testTransport() {
        return {
            activeProvider: this.activeProvider,
            resendConfigured: !!(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY),
            sendgridConfigured: !!process.env.SENDGRID_API_KEY
        };
    }

    async _sendViaResend(payload) {
        const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
        const defaultFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Aether AI <onboarding@resend.dev>';

        const body = JSON.stringify({
            from: defaultFrom,
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
            text: payload.text
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'api.resend.com',
                path: '/emails',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                },
                timeout: 10000
            }, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    let parsedData;
                    try { parsedData = JSON.parse(responseData); } catch { parsedData = responseData; }

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const messageId = parsedData?.id || `resend_${Date.now()}`;
                        console.log(`[EmailService] ✅ DISPATCH SUCCESS | Provider: Resend API | Status: ${res.statusCode} | Recipient: ${payload.to} | MessageID: ${messageId}`);
                        resolve({
                            success: true,
                            provider: 'Resend HTTP API',
                            statusCode: res.statusCode,
                            messageId,
                            response: parsedData
                        });
                    } else {
                        const errMsg = parsedData?.message || parsedData?.error || responseData;
                        console.error(`[EmailService] ❌ DISPATCH FAILED | Provider: Resend API | Status: ${res.statusCode} | Error: ${errMsg}`);
                        reject(new Error(`Resend API Error (HTTP ${res.statusCode}): ${errMsg}`));
                    }
                });
            });

            req.on('error', (err) => {
                console.error(`[EmailService] ❌ Network Error during Resend API call: ${err.message}`);
                reject(err);
            });

            req.on('timeout', () => {
                req.destroy();
                console.error(`[EmailService] ❌ Resend API Request Timeout (10s)`);
                reject(new Error('Resend API HTTP Request Timeout'));
            });

            req.write(body);
            req.end();
        });
    }

    async _sendViaSendGrid(payload) {
        const apiKey = process.env.SENDGRID_API_KEY;
        const defaultFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Aether AI <noreply@aetherai.com>';

        const body = JSON.stringify({
            personalizations: [{ to: [{ email: payload.to }] }],
            from: { email: defaultFrom.includes('<') ? defaultFrom.split('<')[1].replace('>', '') : defaultFrom },
            subject: payload.subject,
            content: [
                { type: 'text/html', value: payload.html },
                { type: 'text/plain', value: payload.text }
            ]
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'api.sendgrid.com',
                path: '/v3/mail/send',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                },
                timeout: 10000
            }, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const messageId = res.headers['x-message-id'] || `sendgrid_${Date.now()}`;
                        console.log(`[EmailService] ✅ DISPATCH SUCCESS | Provider: SendGrid API | Status: ${res.statusCode} | Recipient: ${payload.to} | MessageID: ${messageId}`);
                        resolve({
                            success: true,
                            provider: 'SendGrid HTTP API',
                            statusCode: res.statusCode,
                            messageId
                        });
                    } else {
                        console.error(`[EmailService] ❌ DISPATCH FAILED | Provider: SendGrid API | Status: ${res.statusCode} | Response: ${responseData}`);
                        reject(new Error(`SendGrid API Error (HTTP ${res.statusCode}): ${responseData}`));
                    }
                });
            });

            req.on('error', (err) => reject(err));
            req.on('timeout', () => { req.destroy(); reject(new Error('SendGrid HTTP Request Timeout')); });

            req.write(body);
            req.end();
        });
    }

    async _send(payload) {
        const { to, subject, html, text } = payload;
        console.log(`[EmailService] ====================================================`);
        console.log(`[EmailService] OUTBOUND HTTP EMAIL DISPATCH`);
        console.log(`[EmailService] Recipient: ${to}`);
        console.log(`[EmailService] Subject:   "${subject}"`);
        console.log(`[EmailService] Provider:  ${this.activeProvider}`);
        console.log(`[EmailService] ====================================================`);

        const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
        const sendgridKey = process.env.SENDGRID_API_KEY;

        if (resendKey) {
            try {
                return await this._sendViaResend(payload);
            } catch (err) {
                console.error(`[EmailService] Resend API failed: ${err.message}`);
                throw err;
            }
        }

        if (sendgridKey) {
            try {
                return await this._sendViaSendGrid(payload);
            } catch (err) {
                console.error(`[EmailService] SendGrid API failed: ${err.message}`);
                throw err;
            }
        }

        // Fallback HTTP Console Logger (When no external API key is set)
        console.log(`[EmailService] 📢 DISPATCH LOGGED TO CONSOLE (Fallback Engine):`);
        console.log(`[EmailService] TO: ${to}`);
        console.log(`[EmailService] SUBJECT: ${subject}`);
        console.log(`[EmailService] CONTENT SUMMARY:\n${text}`);
        console.log(`[EmailService] ====================================================`);

        return {
            success: true,
            provider: 'Console Logger (No API Key Configured)',
            messageId: `console_${Date.now()}`
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

const authService = require('../services/auth/auth.service');

class AuthController {

    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            return res.status(201).json({ success: true, message: result.message, data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
            const ua = req.headers['user-agent'] || '';
            const result = await authService.login(req.body, ip, ua);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(401).json({ success: false, message: error.message });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
            const ua = req.headers['user-agent'] || '';
            const result = await authService.verifyOTP(email, otp, ip, ua);
            return res.status(200).json({ success: true, message: 'Verification successful', data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async resendOTP(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.resendOTP(email);
            return res.status(200).json({ success: true, message: result?.message || 'OTP sent.' });
        } catch (error) {
            return res.status(429).json({ success: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            return res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            return res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async emailHealth(req, res) {
        try {
            const emailService = require('../services/email/email.service');
            const status = await emailService.testTransport();
            return res.status(200).json({ success: true, data: status });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async diagSmtp(req, res) {
        const dns = require('dns').promises;
        const net = require('net');
        const tls = require('tls');
        const nodemailer = require('nodemailer');

        const diag = {
            env: {
                SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
                SMTP_PORT: process.env.SMTP_PORT || '465',
                SMTP_SECURE: process.env.SMTP_SECURE || 'true',
                SMTP_USER_EXISTS: !!process.env.SMTP_USER,
                SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
                RESEND_KEY_EXISTS: !!process.env.RESEND_API_KEY
            },
            dns: null,
            tcp465: null,
            tcp587: null,
            tls465: null,
            nodemailer: null
        };

        // 1. DNS Lookup
        try {
            const ips = await dns.resolve4('smtp.gmail.com');
            diag.dns = { success: true, ips };
        } catch (err) {
            diag.dns = { success: false, error: err.message, code: err.code };
        }

        // Helper for TCP test
        function testTcp(port) {
            return new Promise((resolve) => {
                const start = Date.now();
                const s = new net.Socket();
                s.setTimeout(5000);
                s.on('connect', () => { s.destroy(); resolve({ success: true, port, duration: Date.now() - start }); });
                s.on('timeout', () => { s.destroy(); resolve({ success: false, port, error: 'Connection Timeout (5s)' }); });
                s.on('error', (err) => { s.destroy(); resolve({ success: false, port, error: err.message, code: err.code }); });
                s.connect(port, 'smtp.gmail.com');
            });
        }

        diag.tcp465 = await testTcp(465);
        diag.tcp587 = await testTcp(587);

        // Helper for TLS test on 465
        function testTls() {
            return new Promise((resolve) => {
                const start = Date.now();
                const socket = tls.connect({
                    host: 'smtp.gmail.com',
                    port: 465,
                    timeout: 5000,
                    rejectUnauthorized: false
                }, () => {
                    const protocol = socket.getProtocol();
                    const cipher = socket.getCipher();
                    socket.end();
                    resolve({ success: true, duration: Date.now() - start, protocol, cipher });
                });
                socket.on('timeout', () => { socket.destroy(); resolve({ success: false, error: 'TLS Handshake Timeout (5s)' }); });
                socket.on('error', (err) => { socket.destroy(); resolve({ success: false, error: err.message, code: err.code }); });
            });
        }

        diag.tls465 = await testTls();

        // Nodemailer direct dispatch test
        const debugLogs = [];
        const customLogger = {
            trace: (...args) => debugLogs.push(['TRACE', ...args]),
            debug: (...args) => debugLogs.push(['DEBUG', ...args]),
            info: (...args) => debugLogs.push(['INFO', ...args]),
            warn: (...args) => debugLogs.push(['WARN', ...args]),
            error: (...args) => debugLogs.push(['ERROR', ...args])
        };

        const user = process.env.SMTP_USER || 'kgsdhakar8107@gmail.com';
        const pass = process.env.SMTP_PASS || 'vkuzmxktjmyvztqb';

        const testTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            logger: customLogger,
            debug: true,
            connectionTimeout: 8000
        });

        try {
            const info = await testTransporter.sendMail({
                from: `Aether AI <${user}>`,
                to: 'kgsdhakar8107@gmail.com',
                subject: `Aether AI Live Diagnostic ${Date.now()}`,
                text: 'Live Render SMTP Diagnostic Check.'
            });
            diag.nodemailer = { success: true, messageId: info.messageId, response: info.response, debugLogs };
        } catch (err) {
            diag.nodemailer = { success: false, error: err.message, code: err.code, stack: err.stack, debugLogs };
        }

        return res.status(200).json({ success: true, data: diag });
    }

    async devDeleteUser(req, res) {
        try {
            const User = require('../models/User.model');
            await User.deleteOne({ email: req.body.email });
            return res.status(200).json({ success: true, message: `Deleted ${req.body.email}` });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async profile(req, res) {
        return res.status(200).json({ success: true, data: req.user });
    }

    async logout(req, res) {
        try {
            const result = await authService.logout();
            return res.status(200).json({ success: true, message: 'Logout successful', data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();
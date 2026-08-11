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

    async googleAuth(req, res) {
        try {
            const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
            const ua = req.headers['user-agent'] || '';
            const result = await authService.googleAuth(req.body, ip, ua);
            return res.status(200).json({ success: true, message: result.message, data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
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
const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { loginLimiter, forgotPasswordLimiter, otpLimiter } = require('../middleware/rateLimiter.middleware');

// POST /register
router.post('/register',
    [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    validationMiddleware,
    authController.register
);

// POST /login
router.post('/login',
    loginLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validationMiddleware,
    authController.login
);

// POST /google
router.post('/google',
    loginLimiter,
    authController.googleAuth
);

// POST /verify-otp
router.post('/verify-otp',
    otpLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric')
    ],
    validationMiddleware,
    authController.verifyOTP
);

// POST /resend-otp
router.post('/resend-otp',
    otpLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required')
    ],
    validationMiddleware,
    authController.resendOTP
);

// POST /forgot-password
router.post('/forgot-password',
    forgotPasswordLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
    ],
    validationMiddleware,
    authController.forgotPassword
);

// POST /verify-reset-otp
router.post('/verify-reset-otp',
    otpLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric')
    ],
    validationMiddleware,
    authController.verifyResetOTP
);

// POST /resend-reset-otp
router.post('/resend-reset-otp',
    otpLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required')
    ],
    validationMiddleware,
    authController.resendResetOTP
);

// POST /reset-password
router.post('/reset-password',
    [
        body('token').notEmpty().withMessage('Reset token is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    validationMiddleware,
    authController.resetPassword
);

// GET /email-health (diagnostic)
router.get('/email-health', authController.emailHealth);

// POST /dev-delete-user (testing)
router.post('/dev-delete-user', authController.devDeleteUser);

// GET /profile (protected)
router.get('/profile', authMiddleware, authController.profile);

// POST /logout (protected)
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
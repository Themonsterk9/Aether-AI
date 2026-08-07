const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        },

        avatar: {
            type: String,
            default: ""
        },

        documentMode: {
            type: String,
            enum: ["automatic", "strict"],
            default: "automatic"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // Email verification via OTP
        emailVerified: { type: Boolean, default: false },
        registrationOTP: { type: String, default: null },
        registrationOTPExpires: { type: Date, default: null },

        // OTP Login (2FA)
        loginOTP: { type: String, default: null },
        loginOTPExpires: { type: Date, default: null },
        loginOTPAttempts: { type: Number, default: 0 },
        otpResendCount: { type: Number, default: 0 },
        otpResendWindowStart: { type: Date, default: null },

        // Password Reset
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },

        // Session Tracking
        lastLogin: { type: Date, default: null },
        lastLoginIP: { type: String, default: null },
        lastLoginDevice: { type: String, default: null },

        // Security
        failedLoginAttempts: { type: Number, default: 0 },
        accountLockedUntil: { type: Date, default: null }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
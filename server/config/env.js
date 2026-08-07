require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 5002,

    MONGODB_URI: process.env.MONGODB_URI,
    LOCAL_MONGODB_URI: process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/aetherai",

    JWT_SECRET: process.env.JWT_SECRET,

    GEMINI_API_KEY: process.env.GEMINI_API_KEY,

    MODEL: process.env.MODEL || "gemini-flash-latest",

    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "gemini-embedding-2",

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:5002',

    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM: process.env.SMTP_FROM || (process.env.SMTP_USER ? `Aether AI <${process.env.SMTP_USER}>` : 'Aether AI <noreply@gmail.com>'),
};
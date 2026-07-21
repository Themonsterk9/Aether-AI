require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 5002,

    MONGODB_URI: process.env.MONGODB_URI,
    LOCAL_MONGODB_URI: process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/aetherai",

    JWT_SECRET: process.env.JWT_SECRET,

    OLLAMA_URL: process.env.OLLAMA_URL,

    MODEL: process.env.MODEL,

    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    NODE_ENV: process.env.NODE_ENV || "development"
};
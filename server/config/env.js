require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 5002,

    MONGODB_URI: process.env.MONGODB_URI,

    JWT_SECRET: process.env.JWT_SECRET,

    OLLAMA_URL: process.env.OLLAMA_URL,

    MODEL: process.env.MODEL,

    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,

    NODE_ENV: process.env.NODE_ENV || "development"
};
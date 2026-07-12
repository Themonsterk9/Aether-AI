const env = require("./env");

module.exports = {
    baseURL: env.OLLAMA_URL,
    model: env.MODEL,
    embeddingModel: env.EMBEDDING_MODEL
};
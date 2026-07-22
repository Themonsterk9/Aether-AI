const mongoose = require("mongoose");

const connectDB = require("../config/database");

const embeddingService = require("../services/embeddings/embedding.service");

(async () => {

    await connectDB();

    const chunks = [
        "MongoDB stores JSON-like BSON documents.",
        "Express.js is a Node.js web framework.",
        "Ollama allows running large language models locally.",
        "Retrieval-Augmented Generation combines search with LLMs."
    ];

    const embeddings =
        await embeddingService.storeDocumentEmbeddings(
            "6a4ea1498fdf6932596f45a9",
            "6a4ea1498fdf6932596f45a8",
            chunks
        );

    console.log(
        `Stored ${embeddings.length} embeddings`
    );

    await mongoose.disconnect();

})();
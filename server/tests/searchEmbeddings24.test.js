const mongoose = require("mongoose");

const connectDB = require("../config/database");

const embeddingService = require("../services/embeddings/embedding.service");

(async () => {

    await connectDB();

    const userId = "6a4ea1498fdf6932596f45a9";

    const queries = [
        "MongoDB database",
        "Artificial Intelligence",
        "Local LLM"
    ];

    for (const query of queries) {

        console.log("\n==================================");
        console.log(`Query: ${query}`);
        console.log("==================================");

        const results =
            await embeddingService.searchRelevantChunks(
                userId,
                query
            );

        console.table(
            results.map(result => ({
                Score: result.score.toFixed(4),
                Chunk: result.chunk
            }))
        );

    }

    await mongoose.disconnect();

})();
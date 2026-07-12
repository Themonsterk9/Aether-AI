const mongoose = require("mongoose");

const connectDB = require("../config/database");

const embeddingService =
    require("../services/embeddings/embedding.service");

(async () => {

    await connectDB();

    const results =
        await embeddingService.searchRelevantChunks(
            "6a4ea1498fdf6932596f45a9",
            "How does MongoDB work?"
        );

    console.log(results);

    mongoose.disconnect();

})();
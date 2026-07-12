const embeddingService = require("../services/embeddings/embedding.service");

(async () => {

    const vector = await embeddingService.generateEmbedding(
        "Artificial Intelligence"
    );

    console.log(vector.length);

})();
const ollama = require("ollama").default;

const env = require("../../config/env");

const Embedding = require("../../models/Embedding.model");

class EmbeddingService {

    async generateEmbedding(text) {

        const response = await ollama.embed({

            model: env.EMBEDDING_MODEL,

            input: text

        });

        return response.embeddings[0];

    }

    cosineSimilarity(vectorA, vectorB) {

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < vectorA.length; i++) {

            dotProduct += vectorA[i] * vectorB[i];

            magnitudeA += vectorA[i] * vectorA[i];

            magnitudeB += vectorB[i] * vectorB[i];

        }

        magnitudeA = Math.sqrt(magnitudeA);

        magnitudeB = Math.sqrt(magnitudeB);

        return dotProduct / (magnitudeA * magnitudeB);

    }

    async storeDocumentEmbeddings(userId, documentId, chunks) {

        const storedEmbeddings = [];

        for (const chunk of chunks) {

            const vector = await this.generateEmbedding(chunk);

            const embedding = await Embedding.create({
                user: userId,
                document: documentId,
                chunk,
                embedding: vector
            });

            storedEmbeddings.push(embedding);

        }

        return storedEmbeddings;

    }

    async searchRelevantChunks(userId, query, limit = 5) {

        const queryEmbedding =
            await this.generateEmbedding(query);

        const embeddings =
            await Embedding.find({
                user: userId,
                document: { $exists: true }
            }).limit(limit * 10);

        const scoredResults = embeddings.map(
            (embedding) => ({

                chunk: embedding.chunk,

                score: this.cosineSimilarity(
                    queryEmbedding,
                    embedding.embedding
                )

            })
        );

        scoredResults.sort(
            (a, b) => b.score - a.score
        );

        console.log("Retrieved Chunks");
        console.log(scoredResults);

        return scoredResults.slice(0, limit);

    }

}

module.exports = new EmbeddingService();

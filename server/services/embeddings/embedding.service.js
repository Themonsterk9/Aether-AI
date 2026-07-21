const ollama = require("ollama").default;
const env = require("../../config/env");
const Embedding = require("../../models/Embedding.model");

class EmbeddingService {
    async generateEmbedding(text) {
        const modelName = env.EMBEDDING_MODEL || "nomic-embed-text";
        try {
            const response = await ollama.embed({
                model: modelName,
                input: text
            });
            return response.embeddings[0];
        } catch (err) {
            console.warn(`[EmbeddingService] Failed embedding with ${modelName}, trying fallback model:`, err.message);
            // Fallback attempt
            try {
                const response = await ollama.embed({
                    model: "nomic-embed-text",
                    input: text
                });
                return response.embeddings[0];
            } catch (fallbackErr) {
                console.error("[EmbeddingService] Embedding generation failed:", fallbackErr.message);
                throw fallbackErr;
            }
        }
    }

    cosineSimilarity(vectorA, vectorB) {
        if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;
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

        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    async storeDocumentEmbeddings(userId, documentId, chunks, fileName = "") {
        // Embedding Caching Check: Reuse existing vectors if document already embedded
        const existing = await Embedding.find({ user: userId, document: documentId });
        if (existing && existing.length > 0) {
            console.log(`[Embedding Caching] Reusing ${existing.length} cached vectors for doc ${documentId}`);
            return existing;
        }

        const storedEmbeddings = [];

        for (let i = 0; i < chunks.length; i++) {
            const item = typeof chunks[i] === "string" ? { text: chunks[i], page: 1, chunkIndex: i } : chunks[i];
            const vector = await this.generateEmbedding(item.text);

            const embeddingDoc = await Embedding.create({
                user: userId,
                document: documentId,
                chunk: item.text,
                embedding: vector,
                fileName: item.fileName || fileName,
                page: item.page || 1,
                chunkIndex: item.chunkIndex ?? i,
                uploadTimestamp: new Date()
            });

            storedEmbeddings.push(embeddingDoc);
        }

        return storedEmbeddings;
    }

    async searchRelevantChunks(userId, query, limit = 5) {
        try {
            const queryEmbedding = await this.generateEmbedding(query);

            const embeddings = await Embedding.find({
                user: userId,
                document: { $exists: true, $ne: null }
            }).limit(500);

            if (!embeddings || embeddings.length === 0) {
                return [];
            }

            const scoredResults = embeddings.map((doc) => ({
                chunk: doc.chunk,
                score: this.cosineSimilarity(queryEmbedding, doc.embedding),
                fileName: doc.fileName || "Document",
                page: doc.page || 1,
                chunkIndex: doc.chunkIndex || 0,
                documentId: doc.document
            }));

            scoredResults.sort((a, b) => b.score - a.score);

            return scoredResults.slice(0, limit);
        } catch (error) {
            console.error("[EmbeddingService.searchRelevantChunks] Vector search failed:", error.message);
            return [];
        }
    }
}

module.exports = new EmbeddingService();

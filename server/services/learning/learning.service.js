const Learning = require("../../models/Learning.model");
const Embedding = require("../../models/Embedding.model");
const embeddingService = require("../embeddings/embedding.service");

class LearningService {

    shouldLearn(message) {

        const patterns = [

            /^remember that/i,

            /^always use/i,

            /^from now on/i,

            /^our company/i,

            /^the correct answer is/i

        ];

        return patterns.some(pattern =>
            pattern.test(message.trim())
        );

    }

    async learn(userId, content, source = "user") {

        const text = content.trim();

        if (!text) {
            return null;
        }

        const existing = await Learning.findOne({
            user: userId,
            content: text
        });

        if (existing) {
            return existing;
        }

        const embedding =
            await embeddingService.generateEmbedding(text);

        const learning = await Learning.create({
            user: userId,
            source,
            content: text,
            embedding,
            confidence: 1
        });

        await Embedding.create({
            user: userId,
            learning: learning._id,
            chunk: text,
            embedding
        });

        return learning;

    }

    async getLearnedKnowledge(userId) {

        return await Learning.find({
            user: userId
        }).sort({
            updatedAt: -1
        });

    }

    async searchLearnedKnowledge(userId, query, limit = 5) {

        const queryEmbedding =
            await embeddingService.generateEmbedding(query);

        const learnings =
            await Learning.find({
                user: userId
            });

        const scoredResults = learnings.map(
            (learning) => ({

                content: learning.content,

                score: embeddingService.cosineSimilarity(
                    queryEmbedding,
                    learning.embedding
                )

            })
        );

        scoredResults.sort(
            (a, b) => b.score - a.score
        );

        return scoredResults.slice(0, limit);

    }

}

module.exports = new LearningService();

const mongoose = require("mongoose");
const ollama = require("ollama").default;

const Document = require("../models/Document.model");
const Embedding = require("../models/Embedding.model");
const Learning = require("../models/Learning.model");
const Memory = require("../models/Memory.model");
const env = require("../config/env");

class KnowledgeController {

    async getDashboard(req, res) {

        try {
            const user = req.user._id;

            const [
                uploaded,
                indexed,
                processing,
                recentDocuments,
                memories,
                latestMemory,
                learnedFacts,
                documentChunks
            ] = await Promise.all([
                Document.countDocuments({ user }),
                Document.countDocuments({ user, status: "completed" }),
                Document.countDocuments({ user, status: "processing" }),
                Document.find({ user }).sort({ createdAt: -1 }).limit(5).lean(),
                Memory.countDocuments({ user }),
                Memory.findOne({ user }).sort({ updatedAt: -1 }).lean(),
                Learning.countDocuments({ user }),
                Embedding.countDocuments({ user, document: { $exists: true } })
            ]);

            let ollamaConnected = false;

            try {
                await ollama.list();
                ollamaConnected = true;
            } catch {
                ollamaConnected = false;
            }

            return res.status(200).json({
                success: true,
                data: {
                    documents: { uploaded, indexed, processing, recent: recentDocuments },
                    memory: { count: memories, latestUpdatedAt: latestMemory?.updatedAt || null },
                    learning: { count: learnedFacts, enabled: true },
                    rag: { chunks: documentChunks, ready: documentChunks > 0 },
                    models: {
                        llm: env.MODEL || "Not configured",
                        embedding: env.EMBEDDING_MODEL || "Not configured"
                    },
                    system: {
                        api: true,
                        database: mongoose.connection.readyState === 1,
                        ollama: ollamaConnected,
                        authentication: true
                    }
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

    }

}

module.exports = new KnowledgeController();

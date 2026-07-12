const mongoose = require("mongoose");

const embeddingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document"
        },

        learning: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Learning"
        },

        chunk: {
            type: String,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: true
    }
);

embeddingSchema.index({ user: 1, document: 1 });
embeddingSchema.index({ user: 1, learning: 1 });

module.exports = mongoose.model(
    "Embedding",
    embeddingSchema
);

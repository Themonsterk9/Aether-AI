const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        page: {
            type: Number,
            default: 1
        },

        chunkIndex: {
            type: Number,
            default: 0
        },

        chunk: {
            type: String,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        },

        fileName: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

chunkSchema.index({ user: 1, document: 1 });
chunkSchema.index({ user: 1, document: 1, chunkIndex: 1 });

module.exports = mongoose.model("Chunk", chunkSchema);

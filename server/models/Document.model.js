const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        fileName: {
            type: String,
            required: true,
            trim: true
        },

        filePath: {
            type: String,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "uploaded",
                "processing",
                "completed",
                "failed"
            ],
            default: "uploaded"
        }
    },
    {
        timestamps: true
    }
);

documentSchema.index({ user: 1, status: 1 });
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
    "Document",
    documentSchema
);
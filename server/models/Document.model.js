const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        fileName: {
            type: String,
            required: true,
            trim: true
        },

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        cloudinaryUrl: {
            type: String,
            default: ""
        },

        fileType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        totalPages: {
            type: Number,
            default: 1
        },

        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing"
        },

        uploadDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

documentSchema.index({ user: 1, status: 1 });
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
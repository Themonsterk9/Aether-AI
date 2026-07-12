const mongoose = require("mongoose");

const learningSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        source: {
            type: String,
            enum: [
                "user",
                "assistant",
                "correction",
                "manual"
            ],
            default: "user"
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        embedding: {
            type: [Number],
            required: true
        },

        confidence: {
            type: Number,
            default: 1,
            min: 0,
            max: 1
        }
    },
    {
        timestamps: true
    }
);

learningSchema.index({ user: 1, content: 1 });
learningSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model(
    "Learning",
    learningSchema
);
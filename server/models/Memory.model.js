const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "profile",
                "preference",
                "project",
                "fact",
                "custom"
            ],
            default: "custom"
        },

        key: {
            type: String,
            required: true,
            trim: true
        },

        value: {
            type: String,
            required: true,
            trim: true
        },

        importance: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        },

        lastAccessed: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

memorySchema.index({ user: 1, key: 1, value: 1 });
memorySchema.index({ user: 1, importance: -1, updatedAt: -1 });

module.exports = mongoose.model(
    "Memory",
    memorySchema
);
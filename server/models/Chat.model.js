const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            default: "New Chat"
        },

        messages: [
            {
                role: {
                    type: String,
                    enum: ["user", "assistant", "system"],
                    required: true
                },

                content: {
                    type: String,
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

chatSchema.index({ user: 1, updatedAt: -1 });

module.exports =
    mongoose.models.Chat ||
    mongoose.model(
        "Chat",
        chatSchema
    );
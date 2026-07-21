const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        documentMode: {
            type: String,
            enum: ["automatic", "strict"],
            default: "automatic"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Setting", settingSchema);
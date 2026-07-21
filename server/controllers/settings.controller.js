const User = require("../models/User.model");
const Setting = require("../models/Setting.model");

class SettingsController {
    async getSettings(req, res) {
        try {
            const user = await User.findById(req.user._id).select("-password");
            return res.status(200).json({
                success: true,
                data: {
                    documentMode: user?.documentMode || "automatic"
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateDocumentMode(req, res) {
        try {
            const { mode } = req.body;

            if (!mode || !["automatic", "strict"].includes(mode)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid documentMode. Must be 'automatic' or 'strict'."
                });
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            user.documentMode = mode;
            await user.save();

            // Also keep Setting model updated for backward compatibility
            await Setting.findOneAndUpdate(
                { user: req.user._id },
                { documentMode: mode },
                { upsert: true }
            );

            return res.status(200).json({
                success: true,
                data: {
                    documentMode: user.documentMode
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateSettings(req, res) {
        try {
            const { documentMode, mode } = req.body;
            const targetMode = mode || documentMode;

            if (targetMode && ["automatic", "strict"].includes(targetMode)) {
                const user = await User.findById(req.user._id);
                if (user) {
                    user.documentMode = targetMode;
                    await user.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: "Settings updated successfully",
                data: {
                    documentMode: targetMode || "automatic"
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

module.exports = new SettingsController();
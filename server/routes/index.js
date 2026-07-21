const express = require("express");
const { dbManager } = require("../config/database");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        project: "Aether AI",
        version: "1.0.0",
        status: "Running"
    });
});

router.get("/health", (req, res) => {
    const health = dbManager.getHealthStatus();

    if (!health.success) {
        return res.status(503).json({
            success: false,
            database: health.database,
            status: "disconnected"
        });
    }

    return res.json({
        success: true,
        database: health.database,
        status: "connected"
    });
});

router.use("/auth", require("./auth.routes"));
router.use("/chat", require("./chat.routes"));
router.use("/documents", require("./document.routes"));
router.use("/knowledge", require("./knowledge.routes"));
router.use("/memory", require("./memory.routes"));
router.use("/learning", require("./learning.routes"));
router.use("/settings", require("./settings.routes"));

module.exports = router;
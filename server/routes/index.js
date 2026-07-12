const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        project: "Aether AI",
        version: "1.0.0",
        status: "Running"
    });
});

router.get("/health", (req, res) => {
    res.json({
        success: true,
        database: "Connected",
        ai: "Pending",
        rag: "Pending",
        learning: "Pending"
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
const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chat.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get(
    "/",
    authMiddleware,
    chatController.getChats
);

router.post(
    "/",
    authMiddleware,
    chatController.createChat
);

// Add this BEFORE "/:id"
router.get(
    "/test-ai",
    authMiddleware,
    chatController.testAI
);

router.get(
    "/:id",
    authMiddleware,
    chatController.getChat
);

router.post(
    "/:id/message",
    authMiddleware,
    chatController.sendMessage
);

router.post(
    "/:id/stream",
    authMiddleware,
    chatController.streamMessage
);

router.delete(
    "/:id",
    authMiddleware,
    chatController.deleteChat
);

module.exports = router;
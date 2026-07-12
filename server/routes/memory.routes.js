const express = require("express");

const router = express.Router();

const memoryController = require("../controllers/memory.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get(
    "/",
    authMiddleware,
    memoryController.getMemories
);

router.post(
    "/",
    authMiddleware,
    memoryController.createMemory
);

router.delete(
    "/:id",
    authMiddleware,
    memoryController.deleteMemory
);

module.exports = router;
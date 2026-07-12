const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const knowledgeController = require("../controllers/knowledge.controller");

router.get(
    "/dashboard",
    authMiddleware,
    knowledgeController.getDashboard
);

module.exports = router;

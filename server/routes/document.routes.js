const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const upload =
    require("../middleware/upload.middleware");

const documentController =
    require("../controllers/document.controller");

router.post(
    "/upload",
    authMiddleware,
    upload,
    documentController.uploadDocument
);

router.get(
    "/",
    authMiddleware,
    documentController.getDocuments
);

router.get(
    "/:id",
    authMiddleware,
    documentController.getDocument
);

router.delete(
    "/:id",
    authMiddleware,
    documentController.deleteDocument
);

module.exports = router;
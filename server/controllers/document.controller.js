const documentService = require("../services/documents/document.service");

class DocumentController {

    async uploadDocument(req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "No file uploaded."
                });

            }

            const result =
                await documentService.processDocument(
                    req.user._id,
                    req.file
                );

            return res.status(200).json({
                success: true,
                message: "Document processed successfully.",
                data: {
                    documentId: result.document._id,
                    status: result.document.status,
                    chunks: result.chunks
                }
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async getDocuments(req, res) {

        try {

            const documents =
                await documentService.getDocuments(
                    req.user._id
                );

            return res.status(200).json({
                success: true,
                data: documents
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async getDocument(req, res) {

        try {

            const document =
                await documentService.getDocument(
                    req.params.id,
                    req.user._id
                );

            return res.status(200).json({
                success: true,
                data: document
            });

        } catch (error) {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }

    }

    async deleteDocument(req, res) {

        try {

            const result =
                await documentService.deleteDocument(
                    req.params.id,
                    req.user._id
                );

            return res.status(200).json({
                success: true,
                message: "Document deleted successfully.",
                data: result
            });

        } catch (error) {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }

    }

}

module.exports = new DocumentController();
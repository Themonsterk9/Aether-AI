const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const embeddingService = require("../embeddings/embedding.service");
const Document = require("../../models/Document.model");
const Embedding = require("../../models/Embedding.model");

class DocumentService {

    async extractText(file) {

        switch (file.mimetype) {

            case "text/plain":

                return fs.readFileSync(
                    file.path,
                    "utf8"
                );

            case "text/markdown":

                return fs.readFileSync(
                    file.path,
                    "utf8"
                );

            case "application/pdf": {

                const parser = new PDFParse({
                    url: file.path
                });

                const result = await parser.getText();

                await parser.destroy();

                return result.text;

            }

            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {

                const result =
                    await mammoth.extractRawText({
                        path: file.path
                    });

                return result.value;

            }

            default:

                throw new Error(
                    "Unsupported document type."
                );

        }

    }

    chunkText(text, chunkSize = 500, overlap = 100) {

        const chunks = [];

        let start = 0;

        while (start < text.length) {

            const end = Math.min(
                start + chunkSize,
                text.length
            );

            chunks.push(
                text.substring(start, end)
            );

            start += chunkSize - overlap;

        }

        return chunks;

    }

    async processDocument(userId, file) {
        const startTime = Date.now();
        console.log(`[Document Processing] Starting processing for: ${file.originalname}`);

        const document = await Document.create({

            user: userId,

            originalName: file.originalname,

            fileName: file.filename,

            filePath: file.path,

            mimeType: file.mimetype,

            size: file.size,

            status: "processing"

        });

        try {

            const extractStart = Date.now();
            const text =
                await this.extractText(file);
            console.log(`[Document Timing] Text extraction took ${Date.now() - extractStart}ms`);

            const chunks =
                this.chunkText(text);

            await embeddingService.storeDocumentEmbeddings(

                userId,

                document._id,

                chunks

            );

            document.status = "completed";

            const dbStart = Date.now();
            await document.save();
            console.log(`[Database Timing] document.save() took ${Date.now() - dbStart}ms`);

            console.log(`[Document Processing Timing] Completed processing for ${file.originalname} in ${Date.now() - startTime}ms`);

            return {

                document,

                chunks: chunks.length

            };

        } catch (error) {
            console.error(`[Document Processing Error] Failed to process ${file.originalname}:`, error);

            document.status = "failed";

            await document.save();

            throw error;

        }

    }

    async getDocuments(userId) {

        return await Document.find({
            user: userId
        })
        .sort({
            createdAt: -1
        });

    }

    async getDocument(documentId, userId) {

        const document = await Document.findOne({
            _id: documentId,
            user: userId
        });

        if (!document) {
            throw new Error("Document not found.");
        }

        return document;

    }

    async deleteDocument(documentId, userId) {

        const document = await Document.findOne({
            _id: documentId,
            user: userId
        });

        if (!document) {
            throw new Error("Document not found.");
        }

        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Embedding.deleteMany({
            document: document._id
        });

        await Document.deleteOne({
            _id: document._id
        });

        return {
            deleted: true
        };

    }

}

module.exports = new DocumentService();
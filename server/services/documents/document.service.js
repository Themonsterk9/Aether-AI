const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const embeddingService = require("../embeddings/embedding.service");
const cloudinaryService = require("../cloudinary/cloudinary.service");
const Document = require("../../models/Document.model");
const Chunk = require("../../models/Chunk.model");

class DocumentService {
    async extractText(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;

        try {
            if (ext === ".txt" || mime === "text/plain" || ext === ".md" || mime === "text/markdown") {
                return fs.readFileSync(file.path, "utf8");
            }

            if (ext === ".csv" || mime === "text/csv" || mime === "application/csv") {
                const rawCsv = fs.readFileSync(file.path, "utf8");
                return `CSV File Content (${file.originalname}):\n${rawCsv}`;
            }

            if (ext === ".json" || mime === "application/json" || mime === "text/json") {
                const rawJson = fs.readFileSync(file.path, "utf8");
                try {
                    const parsed = JSON.parse(rawJson);
                    return `JSON Data (${file.originalname}):\n${JSON.stringify(parsed, null, 2)}`;
                } catch {
                    return rawJson;
                }
            }

            if (ext === ".pdf" || mime === "application/pdf") {
                const dataBuffer = fs.readFileSync(file.path);
                const parser = new PDFParse({ data: dataBuffer });
                const result = await parser.getText();
                await parser.destroy();
                return result.text || "";
            }

            if (ext === ".docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const result = await mammoth.extractRawText({ path: file.path });
                return result.value || "";
            }

            // Fallback: try reading as text
            return fs.readFileSync(file.path, "utf8");
        } catch (err) {
            console.error(`[DocumentService.extractText] Failed to parse ${file.originalname}:`, err.message);
            throw new Error(`Could not extract text from document (${file.originalname}): ${err.message}`);
        }
    }

    chunkTextWithMetadata(text, fileName, chunkSize = 600, overlap = 120) {
        const chunks = [];
        if (!text || text.trim().length === 0) return chunks;

        const rawPages = text.split(/\f|\n{3,}/);
        let globalChunkIndex = 0;

        if (rawPages.length > 1) {
            rawPages.forEach((pageText, pageIdx) => {
                const pageNum = pageIdx + 1;
                let start = 0;
                while (start < pageText.length) {
                    const end = Math.min(start + chunkSize, pageText.length);
                    const chunkContent = pageText.substring(start, end).trim();
                    if (chunkContent.length > 10) {
                        chunks.push({
                            text: chunkContent,
                            page: pageNum,
                            chunkIndex: globalChunkIndex++,
                            fileName
                        });
                    }
                    start += chunkSize - overlap;
                }
            });
        } else {
            let start = 0;
            while (start < text.length) {
                const end = Math.min(start + chunkSize, text.length);
                const chunkContent = text.substring(start, end).trim();
                if (chunkContent.length > 10) {
                    const pageNum = Math.floor(start / 2500) + 1;
                    chunks.push({
                        text: chunkContent,
                        page: pageNum,
                        chunkIndex: globalChunkIndex++,
                        fileName
                    });
                }
                start += chunkSize - overlap;
            }
        }

        return chunks;
    }

    async processDocument(userId, file) {
        const startTime = Date.now();
        console.log(`[Document Pipeline] Starting official processing for: ${file.originalname}`);

        // Step 1: Upload original file to Cloudinary & get secure_url
        const cloudinaryResult = await cloudinaryService.uploadFile(file.path, file.originalname);

        // Step 2: Create Document metadata in MongoDB
        const document = await Document.create({
            user: userId,
            originalName: file.originalname,
            fileName: file.filename || file.originalname,
            cloudinaryUrl: cloudinaryResult.secureUrl,
            fileType: file.mimetype || "application/octet-stream",
            fileSize: file.size || 0,
            totalPages: 1,
            status: "processing",
            uploadDate: new Date()
        });

        try {
            // Step 3: Extract text from document
            const text = await this.extractText(file);
            const chunksWithMeta = this.chunkTextWithMetadata(text, file.originalname);

            const maxPage = chunksWithMeta.reduce((max, c) => Math.max(max, c.page || 1), 1);
            document.totalPages = maxPage;

            // Step 4: Generate embeddings with nomic-embed-text & store chunks in Chunks collection
            await embeddingService.storeDocumentEmbeddings(
                userId,
                document._id,
                chunksWithMeta,
                file.originalname
            );

            // Step 5: Update document status to completed
            document.status = "completed";
            await document.save();

            console.log(`[Document Pipeline Completed] ${file.originalname} (${chunksWithMeta.length} chunks) in ${Date.now() - startTime}ms`);

            return {
                document,
                chunks: chunksWithMeta.length,
                cloudinaryUrl: cloudinaryResult.secureUrl
            };
        } catch (error) {
            console.error(`[Document Pipeline Error] Failed to process ${file.originalname}:`, error);
            document.status = "failed";
            await document.save();
            throw error;
        } finally {
            // Step 6: Temp file cleanup using fs.unlink()
            if (file.path && fs.existsSync(file.path)) {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`[Temp Cleanup] Unlinked temp file: ${file.path}`);
                } catch (unlinkErr) {
                    console.warn(`[Temp Cleanup Error] Could not unlink ${file.path}:`, unlinkErr.message);
                }
            }
        }
    }

    async getDocuments(userId) {
        return await Document.find({ user: userId }).sort({ createdAt: -1 });
    }

    async getDocument(documentId, userId) {
        const document = await Document.findOne({ _id: documentId, user: userId });
        if (!document) {
            throw new Error("Document not found.");
        }
        return document;
    }

    async deleteDocument(documentId, userId) {
        const document = await Document.findOne({ _id: documentId, user: userId });
        if (!document) {
            throw new Error("Document not found.");
        }

        // Delete associated chunks in Chunks collection
        await Chunk.deleteMany({ document: document._id });
        await Document.deleteOne({ _id: document._id });

        return { deleted: true };
    }
}

module.exports = new DocumentService();
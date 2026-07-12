import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiFileText, FiSearch, FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";
import documentService from "../../services/document.service";
import UploadCard from "./UploadCard";
import UploadProgress from "./UploadProgress";
import styles from "./FileUpload.module.css";
import { uploadDropzoneVariants } from "../../animations";

const acceptedExtensions = [".txt", ".md", ".pdf", ".docx"];
const maximumSize = 20 * 1024 * 1024;

export default function FileUpload({ onClose, onDocumentsChanged }) {

    const { token } = useAuth();
    const inputRef = useRef(null);
    const [documents, setDocuments] = useState([]);
    const [query, setQuery] = useState("");
    const [dragging, setDragging] = useState(false);
    const [upload, setUpload] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const loadDocuments = useCallback(async () => {
        try {
            const response = await documentService.getDocuments(token);
            setDocuments(response.data || []);
        } catch {
            toast.error("Unable to load documents.");
        }
    }, [token]);

    useEffect(() => {
        if (token) loadDocuments();
    }, [token]);

    const validateFile = (file) => {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        if (!acceptedExtensions.includes(extension)) {
            toast.error("Unsupported file type. Use TXT, Markdown, PDF, or DOCX.");
            return false;
        }

        if (file.size > maximumSize) {
            toast.error("Upload failed. Please check the file type, file size (max 20 MB), and your network connection.");
            return false;
        }

        if (file.size === 0) {
            toast.error("Upload failed. Please check the file type, file size (max 20 MB), and your network connection.");
            return false;
        }

        return true;
    };

    const uploadFiles = async (files) => {
        for (const file of Array.from(files)) {
            if (!validateFile(file)) continue;

            setUpload({ fileName: file.name, progress: 0, processing: false });

            try {
                await documentService.uploadDocument(file, token, (event) => {
                    const progress = event.total
                        ? Math.round((event.loaded * 100) / event.total)
                        : 0;
                    setUpload({ fileName: file.name, progress, processing: progress === 100 });
                });

                setUpload({ fileName: file.name, progress: 100, processing: true });
                await loadDocuments();
                onDocumentsChanged?.();
                toast.success("Document uploaded successfully.");
                if (inputRef.current) inputRef.current.value = "";
            } catch (error) {
                toast.error(error.response?.data?.message || "Upload failed. Please check the file type, file size (max 20 MB), and your network connection.");
            }
        }

        window.setTimeout(() => setUpload(null), 1000);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        uploadFiles(event.dataTransfer.files);
    };

    const deleteDocument = async (document) => {
        setDeletingId(document._id);

        try {
            await documentService.deleteDocument(document._id, token);
            setDocuments((current) => current.filter((item) => item._id !== document._id));
            onDocumentsChanged?.();
            toast.success("Document deleted successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete document.");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredDocuments = documents.filter((document) =>
        document.originalName.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <section className={styles.container} onMouseDown={(event) => event.stopPropagation()} aria-label="Document manager">
                <header className={styles.header}>
                    <div><FiFileText /><h2>Documents</h2></div>
                    <button type="button" onClick={onClose} aria-label="Close documents"><FiX /></button>
                </header>

                <motion.div
                    className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
                    variants={uploadDropzoneVariants}
                    whileHover="hover"
                    whileTap="tap"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload document area"
                    onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    <FiUploadCloud className={styles.icon} />
                    <strong>Drag & Drop Documents</strong>
                    <span>or browse from your computer</span>
                    <button type="button" className={styles.browse} onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }} aria-label="Browse files">
                        Browse Files
                    </button>
                    <input ref={inputRef} className={styles.fileInput} type="file" multiple accept={acceptedExtensions.join(",")} onChange={(event) => uploadFiles(event.target.files)} aria-label="Select files to upload" />
                </motion.div>

                {upload && <UploadProgress {...upload} />}

                <section className={styles.info}>
                    <h3>Supported Documents</h3>
                    <div className={styles.support}>
                        <span>✓ Plain Text (.txt)</span><span>✓ Markdown (.md)</span>
                        <span>✓ PDF (.pdf)</span><span>✓ Microsoft Word (.docx)</span>
                    </div>
                    <p>Maximum upload size <strong>20 MB per file</strong></p>
                </section>

                <section className={styles.documents}>
                    <div className={styles.documentsHeader}>
                        <h3>Uploaded Documents</h3>
                        <label className={styles.search}><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents..." /></label>
                    </div>

                    {filteredDocuments.length ? (
                        <div className={styles.documentList}>
                            {filteredDocuments.map((document) => <UploadCard key={document._id} document={document} deleting={deletingId === document._id} onDelete={deleteDocument} />)}
                        </div>
                    ) : (
                        <div className={styles.emptyState} role="status" aria-live="polite">
                            <FiFileText size={28} />
                            <strong>{documents.length ? "No matching documents" : "No documents uploaded yet."}</strong>
                            <span>{documents.length ? "Try a different search." : "Upload a PDF, DOCX, Markdown, or TXT file to enhance Aether AI's knowledge. Maximum upload size: 20 MB per file."}</span>
                        </div>
                    )}
                </section>
            </section>
        </div>
    );

}

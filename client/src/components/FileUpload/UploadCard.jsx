import { FiFileText, FiTrash2 } from "react-icons/fi";
import styles from "./UploadCard.module.css";

const formatSize = (bytes = 0) => `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;

const typeLabel = (mimeType = "") => {
    if (mimeType === "application/pdf") return "PDF Document";
    if (mimeType.includes("wordprocessingml")) return "Word Document";
    if (mimeType === "text/markdown") return "Markdown Document";
    return "Text Document";
};

export default function UploadCard({ document, onDelete, deleting }) {

    const status = document.status === "completed" ? "Indexed" : document.status === "failed" ? "Failed" : "Processing";
    const statusClass = document.status === "completed" ? styles.indexed : document.status === "failed" ? styles.failed : styles.processing;

    return (
        <article className={styles.card}>
            <div className={styles.fileIcon}><FiFileText /></div>
            <div className={styles.details}>
                <strong>{document.originalName}</strong>
                <span>{typeLabel(document.mimeType)} · {formatSize(document.size)}</span>
            </div>
            <span className={`${styles.status} ${statusClass}`}>{status}</span>
            <button type="button" className={styles.deleteButton} disabled={deleting} onClick={() => onDelete(document)} aria-label={`Delete ${document.originalName}`}>
                <FiTrash2 />
            </button>
        </article>
    );

}

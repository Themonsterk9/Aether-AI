import styles from "./UploadProgress.module.css";

export default function UploadProgress({ fileName, progress, processing }) {

    const stages = [
        "Uploaded",
        "Text Extracted",
        "Document Chunked",
        "Embeddings Generated",
        "Indexed for Search"
    ];

    return (
        <section className={styles.progressCard} role="status" aria-live="polite">
            <div className={styles.progressHeader}>
                <span>{processing ? "Processing document..." : "Uploading..."}</span>
                <span>{processing ? "100%" : `${progress}%`}</span>
            </div>

            <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${processing ? 100 : progress}%` }} />
            </div>

            <strong>{fileName}</strong>

            <div className={styles.stages}>
                {stages.map((stage, index) => (
                    <span className={processing || progress === 100 ? styles.complete : index === 0 ? styles.current : ""} key={stage}>
                        {processing || progress === 100 ? "✓" : index === 0 ? "•" : "○"} {stage}
                    </span>
                ))}
            </div>
        </section>
    );

}

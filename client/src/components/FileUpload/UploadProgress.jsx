import styles from "./UploadProgress.module.css";

export default function UploadProgress({ fileName, progress, processing, stageText }) {
    const stages = [
        "Uploading document...",
        "Processing document...",
        "Generating embeddings...",
        "Indexing knowledge...",
        "Completed"
    ];

    const currentStageIndex = processing || progress === 100 ? 4 : progress < 30 ? 0 : progress < 70 ? 1 : progress < 90 ? 2 : 3;

    return (
        <section className={styles.progressCard} role="status" aria-live="polite">
            <div className={styles.progressHeader}>
                <span>{stageText || stages[currentStageIndex]}</span>
                <span>{processing || progress === 100 ? "100%" : `${progress}%`}</span>
            </div>

            <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${processing || progress === 100 ? 100 : progress}%` }} />
            </div>

            <strong>{fileName}</strong>

            <div className={styles.stages}>
                {stages.map((stage, index) => (
                    <span
                        key={stage}
                        className={index < currentStageIndex || processing ? styles.complete : index === currentStageIndex ? styles.current : ""}
                    >
                        {index < currentStageIndex || processing ? "✓" : index === currentStageIndex ? "•" : "○"} {stage}
                    </span>
                ))}
            </div>
        </section>
    );
}

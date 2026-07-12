import styles from "./KnowledgePanel.module.css";

export default function ModelInfo({ models }) {

    return (
        <div className={styles.modelRows}>
            <div><span>LLM</span><strong>{models.llm}</strong></div>
            <div><span>Embedding</span><strong>{models.embedding}</strong></div>
        </div>
    );

}

import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import styles from "./KnowledgePanel.module.css";

export default function SystemStatus({ system }) {

    const statuses = [
        ["Ollama", system.ollama],
        ["MongoDB", system.database],
        ["API", system.api],
        ["Authentication", system.authentication]
    ];

    return statuses.map(([label, online]) => (
        <div className={styles.systemRow} key={label}>
            {online ? <FiCheckCircle className={styles.online} /> : <FiXCircle className={styles.offline} />}
            <span>{label}</span>
            <small>{online ? "Connected" : "Unavailable"}</small>
        </div>
    ));

}

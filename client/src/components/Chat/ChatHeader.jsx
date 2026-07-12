import styles from "./ChatHeader.module.css";

import { FiMenu, FiSettings } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { LuBrain } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { TbDatabase } from "react-icons/tb";

export default function ChatHeader({ onSettings, onMenu, onKnowledge }) {

    return (
        <header className={styles.header}>

            <div className={styles.identity}>
                {onMenu && (
                    <button type="button" className={styles.iconButton} onClick={onMenu} aria-label="Open sidebar">
                        <FiMenu size={18} />
                    </button>
                )}
                <div className={styles.robotIcon}>
                    <RiRobot2Line size={24} />
                </div>

                <div>
                    <h1>Aether AI</h1>
                    <p>Local AI Assistant</p>
                </div>
            </div>

            <div className={styles.capabilities}>
                <span className={styles.badge}><LuBrain /> Memory</span>
                <span className={styles.badge}><TbDatabase /> RAG</span>
                <span className={styles.badge}><HiSparkles /> Learning</span>
            </div>

            <div className={styles.statusArea}>
                <span className={styles.connection}><span /> Ollama Connected</span>
                {onKnowledge && (
                    <button className={styles.iconButton} type="button" aria-label="Open knowledge panel" onClick={onKnowledge}>
                        <LuBrain size={18} />
                    </button>
                )}
                <button className={styles.settingsButton} type="button" aria-label="Settings" onClick={onSettings}>
                    <FiSettings size={18} />
                </button>
                <span className={styles.version}>v1.0.0</span>
            </div>

        </header>
    );

}

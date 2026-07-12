import { FiMessageCircle, FiSearch } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { TbDatabase } from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";

import useChat from "../../hooks/useChat";
import ChatMessages from "./ChatMessages";
import styles from "./ChatBody.module.css";

export default function ChatBody() {

    const { messages } = useChat();

    if (messages.length > 0) {
        return <ChatMessages />;
    }

    return (
        <main className={styles.emptyState}>
            <div className={styles.heroIcon}><RiRobot2Line size={34} /></div>
            <h2>Welcome to Aether AI</h2>
            <p>Local AI Assistant</p>

            <div className={styles.divider} />

            <div className={styles.features}>
                <span><FiMessageCircle /> Ask Questions</span>
                <span><TbDatabase /> Upload Documents</span>
                <span><LuBrain /> Long-Term Memory</span>
                <span><HiSparkles /> Learning Engine</span>
                <span><FiSearch /> RAG Search</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.documents}>
                <strong>Supported Documents</strong>
                <span>✓ TXT &nbsp; ✓ Markdown &nbsp; ✓ PDF &nbsp; ✓ DOCX</span>
                <small>Maximum upload size: 20 MB per file</small>
            </div>
        </main>
    );

}

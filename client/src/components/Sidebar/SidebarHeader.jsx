import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import useChat from "../../hooks/useChat";
import Logo from "../Common/Logo";
import styles from "./Sidebar.module.css";

export default function SidebarHeader() {
    const { handleNewChat } = useChat();

    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                <Logo />
            </div>

            <motion.button
                type="button"
                className={styles.newChatButton}
                onClick={handleNewChat}
                aria-label="Create new chat"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
            >
                <FiPlus size={18} />
                <span>New Chat</span>
            </motion.button>
        </div>
    );
}

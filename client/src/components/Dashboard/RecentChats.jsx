import { motion } from "framer-motion";
import { FiMessageSquare, FiClock, FiArrowRight } from "react-icons/fi";
import useChat from "../../hooks/useChat";
import styles from "./RecentChats.module.css";

function formatRelativeTime(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentChats({ onViewAll }) {
    const { chats, setCurrentChat } = useChat();

    // Show up to 4 most recent chats
    const recent = chats.slice(0, 4);

    if (recent.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <FiClock className={styles.clockIcon} />
                    <span>Recent Chats</span>
                </div>
                <button
                    type="button"
                    className={styles.viewAllBtn}
                    onClick={onViewAll}
                    aria-label="View all recent chats"
                >
                    View All <FiArrowRight size={13} />
                </button>
            </div>

            <div className={styles.list}>
                {recent.map((chat) => {
                    const title = chat.title || "New Conversation";
                    const timeAgo = formatRelativeTime(chat.updatedAt || chat.createdAt);

                    return (
                        <motion.button
                            key={chat._id || chat.id}
                            type="button"
                            className={styles.chatCard}
                            onClick={() => setCurrentChat(chat)}
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={styles.chatIconWrap}>
                                <FiMessageSquare size={16} />
                            </div>
                            <div className={styles.chatMeta}>
                                <span className={styles.chatTitle}>{title}</span>
                                <span className={styles.chatTime}>{timeAgo}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

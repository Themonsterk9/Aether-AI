import { motion } from "framer-motion";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import useAuth from "../../hooks/useAuth";
import { sidebarVariants } from "../../animations";
import styles from "./Sidebar.module.css";

export default function Sidebar({ onSettings, onClose }) {
    const { user } = useAuth();
    const username = user?.name || "Aether User";
    const userEmail = user?.email || "user@aether.ai";
    const initials = username.substring(0, 2).toUpperCase();

    return (
        <motion.aside
            className={styles.sidebar}
            initial={sidebarVariants.initial}
            animate={sidebarVariants.animate}
            transition={sidebarVariants.transition}
        >
            {onClose && (
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <FiArrowLeft size={18} />
                </button>
            )}

            <SidebarHeader />

            <ConversationList />

            <div className={styles.profileCard}>
                <div className={styles.profileAvatar}>{initials}</div>
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{username}</span>
                    <span className={styles.profileEmail}>{userEmail}</span>
                </div>
                <button
                    className={styles.settingsButton}
                    type="button"
                    onClick={onSettings}
                    aria-label="Settings"
                    title="Settings"
                >
                    <FiSettings size={18} />
                </button>
            </div>
        </motion.aside>
    );
}

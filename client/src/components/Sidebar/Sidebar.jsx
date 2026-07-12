import { motion } from "framer-motion";

import styles from "./Sidebar.module.css";
import { FiArrowLeft, FiSettings } from "react-icons/fi";

import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import useAuth from "../../hooks/useAuth";
import { sidebarVariants } from "../../animations";

export default function Sidebar({ onSettings, onClose }) {

    const { user } = useAuth();

    return (

        <motion.aside className={styles.sidebar} initial={sidebarVariants.initial} animate={sidebarVariants.animate} transition={sidebarVariants.transition}>
            {onClose && (
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close sidebar">
                    <FiArrowLeft />
                </button>
            )}

            <SidebarHeader />

            <ConversationList />

            <div className={styles.storageCard}>

                <div className={styles.storageHeader}>
                    <span>Storage</span>
                    <span>7 / 20 MB</span>
                </div>

                <div className={styles.progress}>
                    <div className={styles.progressFill} />
                </div>

            </div>

            <div className={styles.profileCard}>

                <div className={styles.profileName}>
                    {user?.name || "Aether User"}
                </div>

                <div className={styles.profileEmail}>
                    {user?.email || "No email available"}
                </div>

                <button className={styles.settingsButton} type="button" onClick={onSettings}>
                    <FiSettings />
                    <span>Settings</span>
                </button>

            </div>

        </motion.aside>

    );

}

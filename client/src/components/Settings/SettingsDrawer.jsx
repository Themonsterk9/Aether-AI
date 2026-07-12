import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { FiFileText, FiSettings, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { LuBrain } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";

import AboutSection from "./AboutSection";
import AISection from "./AISection";
import AppearanceSection from "./AppearanceSection";
import IntelligenceSection from "./IntelligenceSection";
import UploadSection from "./UploadSection";
import styles from "./SettingsDrawer.module.css";
import { drawerVariants } from "../../animations";

const sections = [
    ["Appearance", <HiSparkles />, AppearanceSection],
    ["AI", <RiRobot2Line />, AISection],
    ["Intelligence", <LuBrain />, IntelligenceSection],
    ["Upload", <FiFileText />, UploadSection],
    ["About", <FiSettings />, AboutSection]
];

export default function SettingsDrawer({ onClose }) {

    const drawerRef = useRef(null);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", closeOnEscape);
        drawerRef.current?.focus();

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [onClose]);

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <motion.aside
                ref={drawerRef}
                className={styles.drawer}
                onMouseDown={(event) => event.stopPropagation()}
                aria-label="Settings"
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                initial={drawerVariants.initial}
                animate={drawerVariants.animate}
                exit={drawerVariants.exit}
                transition={drawerVariants.transition}
            >
                <header className={styles.header}>
                    <h2><FiSettings /> Settings</h2>
                    <button type="button" onClick={onClose} aria-label="Close settings"><FiX /></button>
                </header>

                {sections.map(([title, icon, Section]) => (
                    <section className={styles.section} key={title}>
                        <h3>{icon}{title}</h3>
                        <div className={styles.content}><Section /></div>
                    </section>
                ))}
            </motion.aside>
        </div>
    );

}

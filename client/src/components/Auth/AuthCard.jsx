import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiRobot2Line } from "react-icons/ri";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./AuthCard.module.css";

export default function AuthCard({ title, subtitle, error, children, footerLinkText, footerActionText, footerLinkTo }) {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <Link to="/" className={styles.backLink}>
                    <FiArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                {/* Logo */}
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                        <RiRobot2Line size={28} />
                    </div>
                    <h2 className={styles.brandTitle}>Aether AI</h2>
                    <span className={styles.brandSub}>Local AI Assistant</span>
                </div>

                {/* Card Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        className={styles.errorBanner}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        role="alert"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Form fields */}
                <div className={styles.formContainer}>
                    {children}
                </div>

                {/* Card Footer */}
                {footerLinkText && (
                    <p className={styles.footerText}>
                        {footerLinkText}{" "}
                        <Link to={footerLinkTo} className={styles.footerLink}>
                            {footerActionText}
                        </Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
}

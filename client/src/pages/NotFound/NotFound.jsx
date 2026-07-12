import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import styles from "./NotFound.module.css";

export default function NotFound() {
    return (
        <div className={styles.page}>
            <motion.div
                className={styles.content}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <motion.span
                    className={styles.code}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                >
                    404
                </motion.span>

                <h1 className={styles.heading}>Page Not Found</h1>

                <p className={styles.description}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <Link to="/" className={styles.homeBtn}>
                    Go Back Home
                </Link>
            </motion.div>
        </div>
    );
}
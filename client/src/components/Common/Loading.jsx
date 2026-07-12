import { motion } from "framer-motion";
import styles from "./Loading.module.css";

export default function Loading() {
    return (
        <div role="status" aria-live="polite" aria-label="Loading" className={styles.wrapper}>
            {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                    key={i}
                    className={styles.bar}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay }}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
}
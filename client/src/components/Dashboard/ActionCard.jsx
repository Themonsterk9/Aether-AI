import { motion } from "framer-motion";
import styles from "./ActionCard.module.css";

export default function ActionCard({ icon: Icon, title, description, onClick }) {
    return (
        <motion.button
            type="button"
            className={styles.card}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className={styles.iconWrapper}>
                <Icon size={20} className={styles.icon} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
        </motion.button>
    );
}

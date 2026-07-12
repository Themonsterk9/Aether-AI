import { motion } from "framer-motion";
import styles from "./StatCard.module.css";

export default function StatCard({ icon, title, children }) {

    return (
        <motion.section className={styles.card} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
            <h3>{icon}{title}</h3>
            <div className={styles.content}>{children}</div>
        </motion.section>
    );

}

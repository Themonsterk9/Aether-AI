import styles from "./MainLayout.module.css";

export default function MainLayout({ children }) {
    return (
        <div className={styles.layout}>
            {children}
        </div>
    );
}
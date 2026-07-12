import styles from "./ChatLayout.module.css";

export default function ChatLayout({ children }) {
    return <div className={styles.layout}>{children}</div>;
}
import { RiRobot2Line } from "react-icons/ri";
import styles from "./Logo.module.css";

export default function Logo() {
    return (
        <div className={styles.logo}>
            <div className={styles.icon}>
                <RiRobot2Line size={26} />
            </div>

            <div>
                <h1>Aether AI</h1>
                <span>Local AI Assistant</span>
            </div>
        </div>
    );
}

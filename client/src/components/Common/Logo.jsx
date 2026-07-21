import AetherLogo from "./AetherLogo";
import styles from "./Logo.module.css";

export default function Logo({ size = 36, showText = true, className = "" }) {
    return (
        <div className={`${styles.logo} ${className}`} aria-label="Aether AI">
            <AetherLogo size={size} aria-hidden={true} />
            {showText && (
                <div className={styles.brandText}>
                    <h1>Aether AI</h1>
                    <span>Local AI Assistant</span>
                </div>
            )}
        </div>
    );
}

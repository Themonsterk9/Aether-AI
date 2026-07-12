import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiShield, FiArrowLeft } from "react-icons/fi";

import authService from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";

import styles from "./Profile.module.css";

export default function Profile() {

    const navigate = useNavigate();

    const {
        user,
        token,
        setUser,
        setToken
    } = useAuth();

    const handleLogout = async () => {

        try {
            await authService.logout(token);
        } catch {
            // Ignore logout request errors
        } finally {
            setUser(null);
            setToken(null);
            navigate("/login");
        }

    };

    const initial = user?.name
        ? user.name.charAt(0).toUpperCase()
        : "?";

    const infoRows = [
        { icon: <FiUser size={16} />, label: "Name",  value: user?.name },
        { icon: <FiMail size={16} />, label: "Email", value: user?.email },
        { icon: <FiShield size={16} />, label: "Role",  value: user?.role },
    ];

    return (
        <div className={styles.page}>
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                {/* Avatar */}
                <div className={styles.avatarWrap}>
                    <div className={styles.avatar} aria-label={`Avatar for ${user?.name}`}>
                        {initial}
                    </div>
                    <h2 className={styles.name}>{user?.name}</h2>
                    <span className={styles.roleTag}>{user?.role}</span>
                </div>

                {/* Info rows */}
                <div className={styles.infoSection}>
                    {infoRows.map(({ icon, label, value }) => (
                        <div key={label} className={styles.infoRow}>
                            <span className={styles.infoIcon}>{icon}</span>
                            <span className={styles.infoLabel}>{label}</span>
                            <span className={styles.infoValue}>{value ?? "—"}</span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Link to="/chat" className={styles.backBtn}>
                        <FiArrowLeft size={16} />
                        Back to Chat
                    </Link>

                    <button
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiMenu,
    FiSettings,
    FiBell,
    FiUser,
    FiLogOut,
    FiBookOpen,
    FiCheckCircle,
    FiInfo,
    FiSliders,
    FiChevronDown
} from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import AetherLogo from "../Common/AetherLogo";

import useAuth from "../../hooks/useAuth";
import styles from "./ChatHeader.module.css";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "Knowledge Base Ready",
        message: "RAG index completed for uploaded documents.",
        time: "5m ago",
        icon: FiCheckCircle,
        unread: true
    },
    {
        id: 2,
        title: "Memory System Active",
        message: "Long-term preference memory updated.",
        time: "1h ago",
        icon: LuBrain,
        unread: true
    },
    {
        id: 3,
        title: "System Update",
        message: "Aether AI engine initialized successfully.",
        time: "2h ago",
        icon: FiInfo,
        unread: false
    }
];

export default function ChatHeader({ onSettings, onMenu, onKnowledge }) {
    const { user, setUser, setToken } = useAuth();
    const navigate = useNavigate();

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    const unreadCount = notifications.filter((n) => n.unread).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        navigate("/login");
    };

    const username = user?.name || "Aether User";
    const userEmail = user?.email || "user@aether.ai";
    const initials = username.substring(0, 2).toUpperCase();

    return (
        <header className={styles.header}>
            {/* Left Identity section */}
            <div className={styles.identity}>
                {onMenu && (
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={onMenu}
                        aria-label="Open sidebar"
                    >
                        <FiMenu size={18} />
                    </button>
                )}

                <AetherLogo size={32} />

                <div className={styles.titleArea}>
                    <h1 className={styles.brandTitle}>Aether AI</h1>
                    <span className={styles.subTitle}>Private AI Assistant</span>
                </div>
            </div>

            {/* Right Tools & Dropdowns section */}
            <div className={styles.rightActions}>
                {/* Knowledge Base Drawer Button */}
                {onKnowledge && (
                    <button
                        className={styles.iconButton}
                        type="button"
                        aria-label="Open Knowledge Panel"
                        title="Knowledge Base"
                        onClick={onKnowledge}
                    >
                        <LuBrain size={18} />
                    </button>
                )}

                {/* Notifications Dropdown */}
                <div className={styles.dropdownContainer} ref={notifRef}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => {
                            setIsNotifOpen((prev) => !prev);
                            setIsUserMenuOpen(false);
                        }}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <FiBell size={18} />
                        {unreadCount > 0 && (
                            <span className={styles.badgeCount}>{unreadCount}</span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                className={styles.dropdownMenu}
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                transition={{ duration: 0.18 }}
                            >
                                <div className={styles.dropdownHeader}>
                                    <span>Notifications</span>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            className={styles.markReadBtn}
                                            onClick={markAllRead}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className={styles.notifList}>
                                    {notifications.length === 0 ? (
                                        <div className={styles.emptyNotif}>No new notifications</div>
                                    ) : (
                                        notifications.map((n) => {
                                            const Icon = n.icon;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`${styles.notifItem} ${n.unread ? styles.unreadItem : ""}`}
                                                >
                                                    <div className={styles.notifIconWrap}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className={styles.notifBody}>
                                                        <div className={styles.notifTitleRow}>
                                                            <span className={styles.notifTitle}>{n.title}</span>
                                                            <span className={styles.notifTime}>{n.time}</span>
                                                        </div>
                                                        <p className={styles.notifMessage}>{n.message}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Settings Quick Button */}
                <button
                    className={styles.iconButton}
                    type="button"
                    aria-label="Settings"
                    title="Settings"
                    onClick={onSettings}
                >
                    <FiSettings size={18} />
                </button>

                {/* User Avatar & Dropdown */}
                <div className={styles.dropdownContainer} ref={userMenuRef}>
                    <button
                        type="button"
                        className={styles.avatarButton}
                        onClick={() => {
                            setIsUserMenuOpen((prev) => !prev);
                            setIsNotifOpen(false);
                        }}
                        aria-label="User Menu"
                    >
                        <div className={styles.avatarCircle}>{initials}</div>
                        <span className={styles.avatarName}>{username}</span>
                        <FiChevronDown size={14} className={styles.chevron} />
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                className={styles.dropdownMenuRight}
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                transition={{ duration: 0.18 }}
                            >
                                <div className={styles.userCardHeader}>
                                    <div className={styles.avatarLarge}>{initials}</div>
                                    <div className={styles.userMeta}>
                                        <span className={styles.userNameText}>{username}</span>
                                        <span className={styles.userEmailText}>{userEmail}</span>
                                    </div>
                                </div>

                                <div className={styles.menuDivider} />

                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                >
                                    <FiUser size={16} />
                                    <span>Profile</span>
                                </button>

                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        onSettings?.();
                                    }}
                                >
                                    <FiSliders size={16} />
                                    <span>Settings</span>
                                </button>

                                {onKnowledge && (
                                    <button
                                        type="button"
                                        className={styles.menuItem}
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            onKnowledge?.();
                                        }}
                                    >
                                        <FiBookOpen size={16} />
                                        <span>Knowledge Base</span>
                                    </button>
                                )}

                                <div className={styles.menuDivider} />

                                <button
                                    type="button"
                                    className={`${styles.menuItem} ${styles.dangerItem}`}
                                    onClick={handleLogout}
                                >
                                    <FiLogOut size={16} />
                                    <span>Log Out</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

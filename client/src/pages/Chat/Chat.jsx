import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ChatLayout from "../../components/Chat/ChatLayout";
import useChat from "../../hooks/useChat";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatHeader from "../../components/Chat/ChatHeader";
import ChatBody from "../../components/Chat/ChatBody";
import ChatInput from "../../components/Input/ChatInput";
import FileUpload from "../../components/FileUpload/FileUpload";
import KnowledgePanel from "../../components/Knowledge/KnowledgePanel";
import SettingsDrawer from "../../components/Settings/SettingsDrawer";

import styles from "./Chat.module.css";

export default function Chat() {
    const { handleNewChat, messages } = useChat();
    const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
    const [isSidebarDrawer, setIsSidebarDrawer] = useState(false);
    const [knowledgeRefreshVersion, setKnowledgeRefreshVersion] = useState(0);

    const refreshKnowledge = useCallback(
        () => setKnowledgeRefreshVersion((v) => v + 1),
        []
    );

    const closeDrawers = useCallback(() => {
        setIsSidebarOpen(false);
        setIsKnowledgeOpen(false);
    }, []);

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            setIsSidebarDrawer(width < 992);
            if (width >= 992) setIsSidebarOpen(false);
        };

        updateLayout();
        window.addEventListener("resize", updateLayout);
        return () => window.removeEventListener("resize", updateLayout);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey) {
                const key = event.key.toLowerCase();

                if (key === "n") {
                    event.preventDefault();
                    handleNewChat();
                    closeDrawers();
                }

                if (key === "k") {
                    event.preventDefault();
                    document.querySelector('input[aria-label="Search conversations"]')?.focus();
                }

                if (key === "u") {
                    event.preventDefault();
                    setIsDocumentManagerOpen(true);
                }

                if (key === ",") {
                    event.preventDefault();
                    setIsSettingsOpen(true);
                }
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeDrawers();
                setIsDocumentManagerOpen(false);
                setIsSettingsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNewChat, closeDrawers]);

    const showSidebar = !isSidebarDrawer || isSidebarOpen;
    const showOverlay = (isSidebarDrawer && isSidebarOpen) || isKnowledgeOpen;

    return (
        <ChatLayout>
            <div className={styles.shell}>
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            className={styles.sidebarWrap}
                            initial={isSidebarDrawer ? { x: "-100%" } : false}
                            animate={{ x: 0 }}
                            exit={isSidebarDrawer ? { x: "-100%" } : false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <Sidebar
                                onSettings={() => {
                                    setIsSettingsOpen(true);
                                    closeDrawers();
                                }}
                                onClose={isSidebarDrawer ? () => setIsSidebarOpen(false) : undefined}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.mainPane}>
                    {/* onKnowledge intentionally omitted — hides Knowledge panel button from default UI.
                        All KnowledgePanel state, code, and drawer logic below remain fully intact. */}
                    <ChatHeader
                        onSettings={() => setIsSettingsOpen(true)}
                        onMenu={() => setIsSidebarOpen(true)}
                    />

                    <AnimatePresence mode="wait">
                        <ChatBody key={messages.length > 0 ? "active-chat" : "welcome-dashboard"} onOpenSidebar={() => setIsSidebarOpen(true)} />
                    </AnimatePresence>

                    {messages.length > 0 && (
                        <ChatInput
                            onUpload={() => setIsDocumentManagerOpen(true)}
                            onSettings={() => setIsSettingsOpen(true)}
                            onKnowledgeChange={refreshKnowledge}
                        />
                    )}
                </div>

                {/* Knowledge Panel Overlay Drawer */}
                <AnimatePresence>
                    {isKnowledgeOpen && (
                        <motion.div
                            className={styles.knowledgeDrawer}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <KnowledgePanel
                                onUpload={() => setIsDocumentManagerOpen(true)}
                                onSettings={() => {
                                    setIsSettingsOpen(true);
                                    closeDrawers();
                                }}
                                onClose={() => setIsKnowledgeOpen(false)}
                                refreshKey={knowledgeRefreshVersion}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showOverlay && <div className={styles.backdrop} onClick={closeDrawers} />}

            {isDocumentManagerOpen && (
                <FileUpload
                    onClose={() => setIsDocumentManagerOpen(false)}
                    onDocumentsChanged={refreshKnowledge}
                />
            )}

            {isSettingsOpen && (
                <SettingsDrawer onClose={() => setIsSettingsOpen(false)} />
            )}
        </ChatLayout>
    );
}

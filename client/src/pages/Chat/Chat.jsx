import { useCallback, useEffect, useState } from "react";

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

    const { handleNewChat } = useChat();
    const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
    const [isSidebarDrawer, setIsSidebarDrawer] = useState(false);
    const [isKnowledgeDrawer, setIsKnowledgeDrawer] = useState(false);
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
            setIsKnowledgeDrawer(width < 1200);
            if (width >= 992) setIsSidebarOpen(false);
            if (width >= 1200) setIsKnowledgeOpen(false);
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
    const showKnowledge = !isKnowledgeDrawer || isKnowledgeOpen;
    const showOverlay = (isSidebarDrawer && isSidebarOpen) || (isKnowledgeDrawer && isKnowledgeOpen);

    return (
        <ChatLayout>
            <div className={styles.shell}>
                {showSidebar && (
                    <div className={styles.sidebarWrap}>
                        <Sidebar
                            onSettings={() => {
                                setIsSettingsOpen(true);
                                closeDrawers();
                            }}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                )}

                <div className={styles.mainPane}>
                    <ChatHeader
                        onSettings={() => setIsSettingsOpen(true)}
                        onMenu={() => setIsSidebarOpen(true)}
                        onKnowledge={() => setIsKnowledgeOpen(true)}
                    />

                    <ChatBody />

                    <ChatInput
                        onUpload={() => setIsDocumentManagerOpen(true)}
                        onSettings={() => setIsSettingsOpen(true)}
                        onKnowledgeChange={refreshKnowledge}
                    />
                </div>

                {showKnowledge && (
                    <div className={styles.knowledgeWrap}>
                        <KnowledgePanel
                            onUpload={() => setIsDocumentManagerOpen(true)}
                            onSettings={() => {
                                setIsSettingsOpen(true);
                                closeDrawers();
                            }}
                            onClose={() => setIsKnowledgeOpen(false)}
                            refreshKey={knowledgeRefreshVersion}
                        />
                    </div>
                )}
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

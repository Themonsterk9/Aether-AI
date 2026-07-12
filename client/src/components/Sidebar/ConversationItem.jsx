import { memo, useCallback, useMemo } from "react";

import styles from "./ConversationItem.module.css";

import { FiMessageSquare, FiTrash } from "react-icons/fi";

import useChat from "../../hooks/useChat";

function ConversationItem({ conversation }) {

    const {
        currentChat,
        setCurrentChat,
        setMessages,
        deleteChat
    } = useChat();

    // Only recompute when currentChat id or conversation id changes
    const active = useMemo(
        () =>
            currentChat?._id === conversation._id ||
            currentChat?.id === conversation.id,
        [currentChat?._id, currentChat?.id, conversation._id, conversation.id]
    );

    // Stable handler — doesn't recreate unless conversation reference changes
    const handleClick = useCallback(() => {
        setCurrentChat(conversation);
        setMessages(conversation.messages || []);
    }, [conversation, setCurrentChat, setMessages]);

    // Handle conversation delete
    const handleDelete = useCallback((e) => {
        e.stopPropagation(); // Prevents click triggering conversation selection
        deleteChat(conversation._id || conversation.id);
    }, [conversation, deleteChat]);

    return (

        <div
            className={`${styles.item} ${active ? styles.active : ""}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={`Open conversation ${conversation.title}`}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >

            <div className={styles.icon}>
                <FiMessageSquare />
            </div>

            <div className={styles.content}>

                <div className={styles.title}>
                    {conversation.title}
                </div>

                <div className={styles.preview}>
                    {conversation.messages?.length
                        ? conversation.messages[conversation.messages.length - 1].content
                        : "No messages yet"}
                </div>

            </div>

            <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                aria-label={`Delete conversation ${conversation.title}`}
                title="Delete Conversation"
            >
                <FiTrash />
            </button>

        </div>

    );

}

export default memo(ConversationItem);
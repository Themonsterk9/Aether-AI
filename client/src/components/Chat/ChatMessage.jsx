import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";

import styles from "./ChatMessage.module.css";

import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { BsArrowClockwise } from "react-icons/bs";
import { FiCheck, FiCopy } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

import useAuth from "../../hooks/useAuth";
import useChat from "../../hooks/useChat";
import Markdown from "../Markdown/Markdown";
import { messageVariants } from "../../animations";

function ChatMessage({ message, isLast = false, isStreaming = false }) {

    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'like', 'dislike', or null
    
    const { user } = useAuth();
    const { regenerateResponse } = useChat();

    // Derived values — only recomputed when their inputs change
    const isUser = useMemo(() => message.role === "user", [message.role]);

    const userInitial = useMemo(
        () => user?.name?.trim()?.charAt(0)?.toUpperCase() || "U",
        [user?.name]
    );

    const timestamp = useMemo(() => {
        if (!message.createdAt) return "";
        return new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }, [message.createdAt]);

    // Stable event handler — does not recreate unless `message.content` changes
    const copyMessage = useCallback(async () => {
        if (!message.content) return;
        await navigator.clipboard?.writeText(message.content);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    }, [message.content]);

    return (
        <motion.article
            className={`${styles.wrapper} ${isUser ? styles.user : ""}`}
            layout
            initial={messageVariants.initial}
            animate={messageVariants.animate}
            transition={messageVariants.transition}
        >

            <div className={styles.avatar} aria-label={isUser ? "You" : "Aether AI"}>
                {isUser ? userInitial : <RiRobot2Line size={20} />}
            </div>

            <div className={styles.content}>
                <div className={styles.meta}>
                    <span>{isUser ? "You" : "Aether AI"}</span>
                    {timestamp && <time>{timestamp}</time>}
                </div>

                <div className={styles.bubble} role={isUser ? "article" : "status"} aria-live={isStreaming ? "polite" : undefined}>
                    {message.content ? <Markdown>{message.content}</Markdown> : null}
                    {isStreaming && <span className={styles.cursor}>▋</span>}
                </div>

                <div className={styles.footer}>
                    <button type="button" onClick={copyMessage} title="Copy message">
                        {copied ? <FiCheck /> : <FiCopy />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    {!isUser && (
                        <>
                            {isLast && (
                                <button type="button" onClick={regenerateResponse} title="Regenerate response">
                                    <BsArrowClockwise />
                                    <span>Regenerate</span>
                                </button>
                            )}
                            <button 
                                type="button" 
                                title="Helpful"
                                onClick={() => setFeedback(feedback === "like" ? null : "like")}
                                style={feedback === "like" ? { color: "var(--accent)" } : {}}
                            >
                                <AiOutlineLike />
                                <span>Like</span>
                            </button>
                            <button 
                                type="button" 
                                title="Not helpful"
                                onClick={() => setFeedback(feedback === "dislike" ? null : "dislike")}
                                style={feedback === "dislike" ? { color: "#ef4444" } : {}}
                            >
                                <AiOutlineDislike />
                                <span>Dislike</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

        </motion.article>
    );

}

export default memo(ChatMessage);

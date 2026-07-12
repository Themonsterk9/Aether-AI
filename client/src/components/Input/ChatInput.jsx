import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import useChat from "../../hooks/useChat";
import useAuth from "../../hooks/useAuth";

import chatService from "../../services/chat.service";

import styles from "./ChatInput.module.css";

import {
    FiSend,
    FiPaperclip,
    FiSettings,
    FiMic
} from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { TbDatabase } from "react-icons/tb";

export default function ChatInput({ onUpload, onSettings, onKnowledgeChange }) {

    const [prompt, setPrompt] = useState("");
    const textareaRef = useRef(null);

    const {
        messages,
        setMessages,
        currentChat,
        setIsTyping,
        isTyping,
        setChats
    } = useChat();

    const { token } = useAuth();

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }, [prompt]);

    const handleSubmit = useCallback(async (event) => {

        event.preventDefault();

        const value = prompt.trim();

        if (!value || !currentChat || isTyping) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: value,
            createdAt: new Date().toISOString()
        };

        const assistantMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString()
        };

        const updatedMessages = [
            ...messages,
            userMessage,
            assistantMessage
        ];

        setMessages(updatedMessages);

        setPrompt("");

        setIsTyping(true);

        try {

            await chatService.streamMessage(
                currentChat._id || currentChat.id,
                value,
                token,
                (event) => {

                    if (event.type === "token") {

                        assistantMessage.content += event.token;

                        setMessages([
                            ...updatedMessages.slice(0, -1),
                            {
                                ...assistantMessage
                            }
                        ]);

                    }

                }
            );

            // Fetch the updated chat from database to sync title updates
            const chatRes = await chatService.getChat(currentChat._id || currentChat.id, token);
            const updatedChat = chatRes.data;

            setChats((prevChats) =>
                prevChats.map((c) =>
                    c._id === updatedChat._id || c.id === updatedChat.id ? updatedChat : c
                )
            );

        } catch (error) {

            alert(
                error.message ||
                "Streaming failed"
            );

        } finally {

            setIsTyping(false);
            onKnowledgeChange?.();

        }

    }, [prompt, currentChat, isTyping, messages, token, setMessages, setIsTyping, setChats, onKnowledgeChange]);

    return (

        <div className={styles.container}>

            <div className={styles.toolbar}>

                <motion.button
                    type="button"
                    className={styles.toolButton}
                    onClick={onUpload}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <FiPaperclip />
                    Upload
                </motion.button>

                <motion.button
                    type="button"
                    className={styles.toolButton}
                    aria-label="Enable memory"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <LuBrain />
                    Memory
                </motion.button>

                <motion.button
                    type="button"
                    className={styles.toolButton}
                    aria-label="Open retrieval augmented generation"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <TbDatabase />
                    RAG
                </motion.button>

                <motion.button
                    type="button"
                    className={styles.toolButton}
                    onClick={onSettings}
                    aria-label="Open settings"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <FiSettings />
                    Settings
                </motion.button>

                <motion.button
                    type="button"
                    className={styles.toolButton}
                    disabled
                >
                    <FiMic />
                    Voice (Soon)
                </motion.button>

            </div>

            <form
                onSubmit={handleSubmit}
                className={styles.inputWrapper}
            >

                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    aria-label="Message input"
                    placeholder="Ask Aether AI anything..."
                    value={prompt}
                    onChange={(event) =>
                        setPrompt(event.target.value)
                    }
                    onKeyDown={(event) => {

                        if (
                            event.key === "Enter" &&
                            !event.shiftKey
                        ) {

                            event.preventDefault();

                            handleSubmit(event);

                        }

                    }}
                />

                <motion.button
                    type="submit"
                    className={styles.sendButton}
                    aria-label="Send message"
                    disabled={!prompt.trim() || !currentChat || isTyping}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <FiSend />
                </motion.button>

            </form>

            <div className={styles.footer}>

                <span>
                    Enter → Send
                </span>

                <span>
                    Shift + Enter → New Line
                </span>

            </div>

        </div>

    );

}

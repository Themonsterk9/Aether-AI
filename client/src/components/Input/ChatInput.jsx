import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import useChat from "../../hooks/useChat";
import useAuth from "../../hooks/useAuth";
import chatService from "../../services/chat.service";
import styles from "./ChatInput.module.css";
import {
    FiSend,
    FiPaperclip,
    FiMic
} from "react-icons/fi";

export default function ChatInput({ onUpload, onKnowledgeChange }) {
    const [prompt, setPrompt] = useState("");
    const [isListening, setIsListening] = useState(false);
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
        ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
    }, [prompt]);

    const handleSubmit = useCallback(async (event) => {
        if (event) event.preventDefault();

        const value = prompt.trim();
        if (!value || !currentChat || isTyping) return;

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
                    if (event.type === "status") {
                        assistantMessage.status = event.status;
                        setMessages([
                            ...updatedMessages.slice(0, -1),
                            { ...assistantMessage }
                        ]);
                    }
                    if (event.type === "token") {
                        assistantMessage.content += event.token;
                        setMessages([
                            ...updatedMessages.slice(0, -1),
                            { ...assistantMessage }
                        ]);
                    }
                }
            );

            const chatRes = await chatService.getChat(currentChat._id || currentChat.id, token);
            const updatedChat = chatRes.data;

            setChats((prevChats) =>
                prevChats.map((c) =>
                    c._id === updatedChat._id || c.id === updatedChat.id ? updatedChat : c
                )
            );
        } catch (error) {
            console.error("Streaming failed:", error);
        } finally {
            setIsTyping(false);
            onKnowledgeChange?.();
        }
    }, [prompt, currentChat, isTyping, messages, token, setMessages, setIsTyping, setChats, onKnowledgeChange]);

    const handleSpeechListen = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <motion.button
                    type="button"
                    className={styles.uploadPillButton}
                    onClick={onUpload}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <FiPaperclip size={15} />
                    <span>Upload Document</span>
                </motion.button>
            </div>

            <form onSubmit={handleSubmit} className={styles.inputWrapper}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    aria-label="Message input"
                    placeholder="Ask anything..."
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />

                <div className={styles.rightActions}>
                    <motion.button
                        type="button"
                        className={`${styles.micButton} ${isListening ? styles.listening : ""}`}
                        onClick={handleSpeechListen}
                        aria-label="Microphone input"
                        title="Voice Input"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiMic size={18} />
                    </motion.button>

                    <motion.button
                        type="submit"
                        className={styles.sendButton}
                        aria-label="Send message"
                        disabled={!prompt.trim() || !currentChat || isTyping}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiSend size={16} />
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

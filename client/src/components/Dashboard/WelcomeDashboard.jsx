import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import AetherLogo from "../Common/AetherLogo";
import {
    FiMic,
    FiSend,
    FiFileText,
    FiImage,
    FiBox,
    FiBookOpen,
    FiHelpCircle,
    FiEdit3,
    FiSun
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useChat from "../../hooks/useChat";
import chatService from "../../services/chat.service";
import ActionCard from "./ActionCard";
import RecentChats from "./RecentChats";
import styles from "./WelcomeDashboard.module.css";

const ACTION_CARDS = [
    {
        id: "docs",
        icon: FiFileText,
        title: "Documents",
        description: "Analyze & summarize uploaded files",
        prompt: "Help me analyze my documents and summarize key points."
    },
    {
        id: "image",
        icon: FiImage,
        title: "Create Image",
        description: "Generate visual concept prompts",
        prompt: "Create a detailed prompt for a futuristic aesthetic artwork."
    },
    {
        id: "product",
        icon: FiBox,
        title: "Invent a Product",
        description: "Brainstorm unique tech concepts",
        prompt: "Invent a novel AI product idea that solves daily productivity issues."
    },
    {
        id: "study",
        icon: FiBookOpen,
        title: "Study for a Test",
        description: "Summarize key exam topics",
        prompt: "Create a structured study plan with core concepts and flashcard questions."
    },
    {
        id: "quiz",
        icon: FiHelpCircle,
        title: "Take a Quiz",
        description: "Test your knowledge interactively",
        prompt: "Give me a 5-question interactive quiz on computer science & technology."
    },
    {
        id: "reply",
        icon: FiSend,
        title: "Draft a Reply",
        description: "Compose professional responses",
        prompt: "Draft a polite and concise professional email response."
    },
    {
        id: "speech",
        icon: FiEdit3,
        title: "Write a Speech",
        description: "Draft compelling talks",
        prompt: "Write an inspiring 2-minute opening speech on innovation and the future of AI."
    },
    {
        id: "sunrise",
        icon: FiSun,
        title: "Paint a Sunrise",
        description: "Create poetic atmospheric scenes",
        prompt: "Write a rich, poetic description of a serene mountain sunrise."
    }
];

export default function WelcomeDashboard({ onOpenSidebar }) {
    const { user } = useAuth();
    const {
        currentChat,
        messages,
        setMessages,
        setIsTyping,
        isTyping,
        setChats
    } = useChat();
    const { token } = useAuth();

    const [inputPrompt, setInputPrompt] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const textareaRef = useRef(null);

    const username = user?.name || user?.email?.split("@")[0] || "User";

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
    }, [inputPrompt]);

    const sendPrompt = async (textToSend) => {
        const value = (textToSend || inputPrompt).trim();
        if (!value || isTyping) return;

        setInputPrompt("");

        let activeChat = currentChat;

        if (!activeChat) {
            try {
                const response = await chatService.createChat(token);
                activeChat = response.data;
                setChats((prev) => [activeChat, ...prev]);
            } catch (err) {
                console.error("Failed to create new chat session:", err);
                return;
            }
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
        setIsTyping(true);

        try {
            await chatService.streamMessage(
                activeChat._id || activeChat.id,
                value,
                token,
                (event) => {
                    if (event.type === "token") {
                        assistantMessage.content += event.token;
                        setMessages([
                            ...updatedMessages.slice(0, -1),
                            { ...assistantMessage }
                        ]);
                    }
                }
            );

            const chatRes = await chatService.getChat(activeChat._id || activeChat.id, token);
            const fullChat = chatRes.data;

            setChats((prevChats) =>
                prevChats.map((c) =>
                    c._id === fullChat._id || c.id === fullChat.id ? fullChat : c
                )
            );
        } catch (error) {
            console.error("Error streaming message:", error);
        } finally {
            setIsTyping(false);
        }
    };

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
            setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const logoSize = windowWidth < 600 ? 64 : windowWidth < 992 ? 80 : 96;

    return (
        <motion.div
            className={styles.dashboard}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className={styles.contentContainer}>
                {/* Logo & Header */}
                <div className={styles.heroSection}>
                    <div className={styles.logoWrap}>
                        <AetherLogo size={logoSize} />
                    </div>

                    <h1 className={styles.brandTitle}>Aether AI</h1>
                    <p className={styles.subtitle}>Private AI Assistant</p>
                    <h2 className={styles.greetingText}>
                        Welcome back, <span className={styles.gradientText}>{username}</span>
                    </h2>
                </div>

                {/* Prompt Bar */}
                <div className={styles.promptSection}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendPrompt();
                        }}
                        className={styles.promptBar}
                    >
                        <textarea
                            ref={textareaRef}
                            className={styles.textarea}
                            placeholder="Ask anything..."
                            aria-label="Ask anything"
                            rows={1}
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendPrompt();
                                }
                            }}
                        />

                        <div className={styles.promptActions}>
                            <motion.button
                                type="button"
                                className={`${styles.micButton} ${isListening ? styles.listening : ""}`}
                                onClick={handleSpeechListen}
                                aria-label="Microphone input"
                                title="Speech Input"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiMic size={18} />
                            </motion.button>

                            <motion.button
                                type="submit"
                                className={styles.sendButton}
                                disabled={!inputPrompt.trim() || isTyping}
                                aria-label="Send message"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiSend size={16} />
                            </motion.button>
                        </div>
                    </form>
                </div>

                {/* Quick Actions Grid */}
                <div className={styles.actionsSection}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.actionsGrid}>
                        {ACTION_CARDS.map((card) => (
                            <ActionCard
                                key={card.id}
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                onClick={() => sendPrompt(card.prompt)}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent Chats Section */}
                <RecentChats onViewAll={onOpenSidebar} />
            </div>
        </motion.div>
    );
}

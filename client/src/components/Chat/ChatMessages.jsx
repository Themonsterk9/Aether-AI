import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowDown } from "react-icons/fi";

import useChat from "../../hooks/useChat";
import ChatMessage from "./ChatMessage";
import styles from "./ChatMessages.module.css";

// How far from the bottom (px) before we consider the user "at the bottom"
const SCROLL_THRESHOLD = 150;

export default function ChatMessages() {

    const { messages, isTyping, currentChat } = useChat();
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const currentChatId = currentChat?._id;

    const shouldAutoScrollRef = useRef(true);
    const isProgrammaticScrollRef = useRef(false);

    /** Returns true when the user is within SCROLL_THRESHOLD of the bottom */
    const isNearBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
    }, []);

    /** Scrolls the container to the very bottom with customizable behavior */
    const scrollToBottomForce = useCallback((behavior = "smooth") => {
        shouldAutoScrollRef.current = true;
        isProgrammaticScrollRef.current = true;

        requestAnimationFrame(() => {
            const el = containerRef.current;
            if (!el) return;
            el.scrollTo({
                top: el.scrollHeight,
                behavior
            });
        });
    }, []);

    /** Smooth-scroll to the very bottom (button click handler) */
    const scrollToBottom = useCallback(() => {
        scrollToBottomForce("smooth");
    }, [scrollToBottomForce]);

    /** Track scroll position to show/hide the button and handle auto-scroll lock toggling */
    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
        setShowScrollBtn(!nearBottom);

        if (nearBottom) {
            shouldAutoScrollRef.current = true;
            isProgrammaticScrollRef.current = false;
        } else if (!isProgrammaticScrollRef.current) {
            shouldAutoScrollRef.current = false;
        }
    }, []);

    /** Interrupt programmatic scroll and evaluate lock if user manually scroll-wheels/touches */
    const handleUserInteraction = useCallback(() => {
        isProgrammaticScrollRef.current = false;
        const el = containerRef.current;
        if (el) {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
            shouldAutoScrollRef.current = nearBottom;
        }
    }, []);

    // Bind interaction event listeners
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.addEventListener("wheel", handleUserInteraction, { passive: true });
        el.addEventListener("touchmove", handleUserInteraction, { passive: true });

        return () => {
            el.removeEventListener("wheel", handleUserInteraction);
            el.removeEventListener("touchmove", handleUserInteraction);
        };
    }, [handleUserInteraction]);

    // Auto-scroll logic when messages change or typing status changes
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        const isUserMsg = lastMsg && lastMsg.role === "user";

        if (isUserMsg) {
            scrollToBottomForce("smooth");
        } else if (isTyping) {
            if (shouldAutoScrollRef.current) {
                scrollToBottomForce("auto");
            }
        } else {
            if (shouldAutoScrollRef.current) {
                scrollToBottomForce("smooth");
            }
        }
    }, [messages, isTyping, scrollToBottomForce]);

    // Switch conversations -> scroll instantly to bottom
    useEffect(() => {
        scrollToBottomForce("auto");
    }, [currentChatId, scrollToBottomForce]);

    return (
        <div
            ref={containerRef}
            className={styles.messages}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => (
                <ChatMessage
                    key={message._id || message.id || index}
                    message={message}
                    isLast={index === messages.length - 1}
                    isStreaming={isTyping && index === messages.length - 1 && message.role === "assistant"}
                />
            ))}
            <div ref={messagesEndRef} />

            {/* Floating "scroll to bottom" button — only visible when user has scrolled up */}
            {showScrollBtn && (
                <button
                    type="button"
                    className={styles.scrollBtn}
                    onClick={scrollToBottom}
                    aria-label="Scroll to latest message"
                    title="Scroll to bottom"
                >
                    <FiArrowDown />
                </button>
            )}
        </div>
    );

}

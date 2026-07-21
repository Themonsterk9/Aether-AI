import useChat from "../../hooks/useChat";
import ChatMessages from "./ChatMessages";
import WelcomeDashboard from "../Dashboard/WelcomeDashboard";
import styles from "./ChatBody.module.css";

export default function ChatBody({ onOpenSidebar }) {
    const { messages } = useChat();

    if (messages.length > 0) {
        return (
            <div className={styles.activeChatContainer}>
                <ChatMessages />
            </div>
        );
    }

    return <WelcomeDashboard onOpenSidebar={onOpenSidebar} />;
}

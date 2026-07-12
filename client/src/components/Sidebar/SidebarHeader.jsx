import styles from "./Sidebar.module.css";

import { FiPlus } from "react-icons/fi";

import useChat from "../../hooks/useChat";
import Logo from "../Common/Logo";

export default function SidebarHeader() {

    const {

        handleNewChat

    } = useChat();

    return (

        <div className={styles.header}>

            <div className={styles.logo}>
                <Logo />
            </div>

            <button

                className={styles.newChatButton}

                onClick={handleNewChat}
                aria-label="Create new chat"

            >

                <FiPlus />

                New Chat

            </button>

        </div>

    );

}

import { memo, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import useChat from "../../hooks/useChat";
import useDebounce from "../../hooks/useDebounce";
import ConversationItem from "./ConversationItem";
import styles from "./ConversationList.module.css";

function categorizeChats(chats) {
    const pinned = [];
    const today = [];
    const yesterday = [];
    const last7Days = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7DaysAgo = startOfToday - (6 * 86400000);

    chats.forEach((chat) => {
        if (chat.isPinned || chat.pinned) {
            pinned.push(chat);
            return;
        }

        const dateVal = chat.updatedAt || chat.createdAt;
        const time = dateVal ? new Date(dateVal).getTime() : 0;

        if (time >= startOfToday) {
            today.push(chat);
        } else if (time >= startOfYesterday) {
            yesterday.push(chat);
        } else if (time >= startOf7DaysAgo) {
            last7Days.push(chat);
        } else {
            older.push(chat);
        }
    });

    return [
        { title: "Pinned", chats: pinned },
        { title: "Today", chats: today },
        { title: "Yesterday", chats: yesterday },
        { title: "Last 7 Days", chats: last7Days },
        { title: "Older", chats: older }
    ];
}

function ConversationList() {
    const { chats } = useChat();
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 200);

    const groups = useMemo(() => {
        const query = debouncedSearch.toLowerCase().trim();

        const filtered = query
            ? chats.filter((chat) =>
                chat.title?.toLowerCase().includes(query)
            )
            : chats;

        return categorizeChats(filtered);
    }, [chats, debouncedSearch]);

    const hasChats = chats.length > 0;
    const activeGroups = groups.filter((group) => group.chats.length > 0);

    return (
        <div className={styles.list}>
            {/* Search bar */}
            <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search chats..."
                    aria-label="Search conversations"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        type="button"
                        className={styles.clearSearchBtn}
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                    >
                        <FiX size={14} />
                    </button>
                )}
            </div>

            {!hasChats ? (
                <div className={styles.empty}>No chats yet. Start a new conversation!</div>
            ) : activeGroups.length === 0 ? (
                <div className={styles.empty}>No matching chats found.</div>
            ) : (
                activeGroups.map((group) => (
                    <div className={styles.section} key={group.title}>
                        <div className={styles.sectionTitle}>{group.title}</div>

                        {group.chats.map((chat) => (
                            <ConversationItem
                                key={chat._id || chat.id}
                                conversation={chat}
                            />
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

export default memo(ConversationList);

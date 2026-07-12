import { memo, useMemo, useState } from "react";

import styles from "./ConversationList.module.css";

import useChat from "../../hooks/useChat";
import useDebounce from "../../hooks/useDebounce";

import ConversationItem from "./ConversationItem";

import { FiSearch } from "react-icons/fi";

function ConversationList() {

    const { chats } = useChat();
    const [search, setSearch] = useState("");

    // Debounce the search query — filter fires 300ms after the user stops typing
    const debouncedSearch = useDebounce(search, 300);

    // Memoize the filtered + grouped list
    const groups = useMemo(() => {
        const query = debouncedSearch.toLowerCase().trim();

        const filtered = query
            ? chats.filter((chat) =>
                chat.title?.toLowerCase().includes(query)
            )
            : chats;

        return [
            { title: "Today", chats: filtered },
            { title: "Yesterday", chats: [] },
            { title: "Older", chats: [] }
        ];
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
                    placeholder="Search conversations…"
                    aria-label="Search conversations"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {!hasChats ? (
                <div className={styles.empty}>No chats yet.</div>
            ) : activeGroups.length === 0 ? (
                <div className={styles.empty}>No matches found.</div>
            ) : (
                activeGroups.map((group) => (
                    <div className={styles.section} key={group.title}>

                        <div className={styles.sectionTitle}>
                            {group.title}
                        </div>

                        {group.chats.map(chat => (

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

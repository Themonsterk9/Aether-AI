import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";

import chatService from "../services/chat.service";
import useAuth from "../hooks/useAuth";

const ChatContext = createContext();

export function ChatProvider({ children }) {

    const { token } = useAuth();

    const [chats, setChatsState] = useState([]);
    const [currentChat, setCurrentChatState] = useState(null);
    const [messages, setMessagesState] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);

    const setChats = useCallback((value) => {
        setChatsState(value);
    }, []);

    // Async function to set active conversation and fetch its latest database state
    const setCurrentChat = useCallback(async (value) => {
        if (!value) {
            setCurrentChatState(null);
            setMessagesState([]);
            return;
        }

        const chatId = value._id || value.id || value;
        if (!chatId) return;

        // Optimistically set metadata first to keep UI responsive
        setCurrentChatState(value);
        setMessagesState(value.messages || []);

        if (!token) return;

        try {
            const response = await chatService.getChat(chatId, token);
            const fullChat = response.data;
            setCurrentChatState(fullChat);
            setMessagesState(fullChat.messages || []);
        } catch (error) {
            console.error("Failed to load chat details from database:", error);
        }
    }, [token]);

    const setMessages = useCallback((value) => {
        setMessagesState(value);

        // Update currentChat and update the corresponding chat in the list in a single render tick
        setCurrentChatState((prevChat) => {
            if (!prevChat) return null;
            const updated = { ...prevChat, messages: value };

            setChatsState((prevChats) =>
                prevChats.map((c) =>
                    c._id === prevChat._id || c.id === prevChat.id
                        ? updated
                        : c
                )
            );

            return updated;
        });
    }, []);

    const handleNewChat = useCallback(async () => {
        if (!token) return;

        try {
            const response = await chatService.createChat(token);
            // The response body contains `{ success: true, message: "...", data: chat }`
            const newChat = response.data; 

            const chatResponse = await chatService.getChat(newChat._id, token);
            const fullChat = chatResponse.data;

            setChatsState((prevChats) => [fullChat, ...prevChats]);
            setCurrentChatState(fullChat);
            setMessagesState(fullChat.messages || []);
        } catch (error) {
            console.error("Failed to create chat in MongoDB:", error);
        }
    }, [token]);

    const deleteChat = useCallback(async (chatId) => {
        if (!token) return;

        try {
            await chatService.deleteChat(chatId, token);

            setChatsState((prevChats) => {
                const updatedChats = prevChats.filter(
                    (chat) => chat._id !== chatId && chat.id !== chatId
                );

                // If we deleted the active chat, automatically select the next remaining conversation
                setCurrentChatState((prevCurrent) => {
                    if (prevCurrent && (prevCurrent._id === chatId || prevCurrent.id === chatId)) {
                        if (updatedChats.length > 0) {
                            const nextChat = updatedChats[0];
                            setMessagesState(nextChat.messages || []);
                            
                            // Async fetch latest full chat details from MongoDB
                            chatService.getChat(nextChat._id || nextChat.id, token)
                                .then((res) => {
                                    setCurrentChatState(res.data);
                                    setMessagesState(res.data.messages || []);
                                })
                                .catch((err) => console.error("Failed to fetch next chat state:", err));

                            return nextChat;
                        } else {
                            setMessagesState([]);
                            return null;
                        }
                    }
                    return prevCurrent;
                });

                return updatedChats;
            });
        } catch (error) {
            console.error("Failed to delete chat from MongoDB:", error);
        }
    }, [token]);

    const regenerateResponse = useCallback(async () => {
        if (!token || !currentChat || messages.length < 2 || isTyping) return;

        const lastUserMessage = messages[messages.length - 2];
        if (lastUserMessage.role !== "user") return;

        const updatedMessages = [
            ...messages.slice(0, -1),
            {
                ...messages[messages.length - 1],
                content: "",
                createdAt: new Date().toISOString()
            }
        ];
        setMessagesState(updatedMessages);
        setIsTyping(true);

        try {
            const assistantMessage = updatedMessages[updatedMessages.length - 1];

            await chatService.streamMessage(
                currentChat._id || currentChat.id,
                lastUserMessage.content,
                token,
                (event) => {
                    if (event.type === "token") {
                        assistantMessage.content += event.token;
                        setMessagesState([
                            ...updatedMessages.slice(0, -1),
                            {
                                ...assistantMessage
                            }
                        ]);
                    }
                }
            );

            // Fetch the updated chat from database to sync final details
            const chatRes = await chatService.getChat(currentChat._id || currentChat.id, token);
            const updatedChat = chatRes.data;

            setChatsState((prevChats) =>
                prevChats.map((c) =>
                    c._id === updatedChat._id || c.id === updatedChat.id ? updatedChat : c
                )
            );
            setCurrentChatState(updatedChat);
            setMessagesState(updatedChat.messages || []);

        } catch (error) {
            console.error("Failed to regenerate response:", error);
        } finally {
            setIsTyping(false);
        }
    }, [token, currentChat, messages, isTyping]);

    useEffect(() => {
        if (!token) {
            setLoadingChats(false);
            return;
        }

        const loadChats = async () => {
            try {
                setLoadingChats(true);
                const response = await chatService.getChats(token);
                const loadedChats = response.data || [];
                setChatsState(loadedChats);

                if (loadedChats.length > 0) {
                    setCurrentChat(loadedChats[0]);
                } else {
                    setCurrentChat(null);
                }
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [token, setCurrentChat]);

     const value = useMemo(() => ({
        chats,
        setChats,
        currentChat,
        setCurrentChat,
        messages,
        setMessages,
        isTyping,
        setIsTyping,
        loadingChats,
        handleNewChat,
        deleteChat,
        regenerateResponse,
    }), [
        chats,
        currentChat,
        messages,
        isTyping,
        loadingChats,
        setChats,
        setCurrentChat,
        setMessages,
        handleNewChat,
        deleteChat,
        regenerateResponse,
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);
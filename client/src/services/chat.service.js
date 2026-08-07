
import api from "./api";

class ChatService {

    async createChat(token) {

        const response = await api.post(
            "/chat",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

    async getChats(token) {

        const response = await api.get(
            "/chat",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

    async getChat(chatId, token) {

        const response = await api.get(
            `/chat/${chatId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

    async sendMessage(chatId, message, token) {

        const response = await api.post(
            `/chat/${chatId}/message`,
            {
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

    async streamMessage(chatId, message, token, onToken) {

        const baseUrl = api.defaults.baseURL.replace(/\/+$/, "");
        const response = await fetch(
            `${baseUrl}/chat/${chatId}/stream`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    message
                })
            }
        );

    if (!response.ok) {
        throw new Error("Streaming request failed");
    }

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {

        const { value, done } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, {
            stream: true
        });

        const events = buffer.split("\n\n");

        buffer = events.pop();

        for (const event of events) {

            if (!event.startsWith("data: ")) {
                continue;
            }

            const payload = JSON.parse(
                event.replace("data: ", "")
            );

            onToken(payload);

        }

    }

}

    async deleteChat(chatId, token) {

        const response = await api.delete(
            `/chat/${chatId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

}

export default new ChatService();
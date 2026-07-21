const chatService = require("../services/chat/chat.service");
const aiService = require("../services/ai/ai.service");

class ChatController {
    async createChat(req, res) {
        try {
            const chat = await chatService.createChat(req.user._id);
            return res.status(201).json({
                success: true,
                message: "Chat created successfully",
                data: chat
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChats(req, res) {
        try {
            const chats = await chatService.getChats(req.user._id);
            return res.status(200).json({
                success: true,
                data: chats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChat(req, res) {
        try {
            const chat = await chatService.getChat(req.params.id, req.user._id);
            return res.status(200).json({
                success: true,
                data: chat
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async testAI(req, res) {
        try {
            const response = await aiService.generateResponse([
                {
                    role: "user",
                    content: "Say hello from Aether AI."
                }
            ]);

            return res.status(200).json({
                success: true,
                data: response
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async sendMessage(req, res) {
        try {
            const { message } = req.body;
            const chat = await chatService.sendMessage(req.params.id, req.user._id, message);
            return res.status(200).json({
                success: true,
                message: "Message sent successfully",
                data: chat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async streamMessage(req, res) {
        try {
            const { message } = req.body;

            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // SSE Status Event: Searching uploaded documents
            res.write(`data: ${JSON.stringify({ type: "status", status: "Searching uploaded documents..." })}\n\n`);

            const prepared = await chatService.prepareChatStreaming(
                req.params.id,
                req.user._id,
                message
            );

            const { chat } = prepared;

            // Handle Strict Mode Fallback when document match is not found
            if (prepared.isStrictFallback) {
                const fallbackReply = prepared.fallbackReply;
                for (const char of fallbackReply) {
                    res.write(`data: ${JSON.stringify({ type: "token", token: char })}\n\n`);
                }

                chat.messages.push({
                    role: "assistant",
                    content: fallbackReply
                });
                await chat.save();

                res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
                return res.end();
            }

            // SSE Status Event: Reading document
            if (prepared.isDocumentAnswer) {
                res.write(`data: ${JSON.stringify({ type: "status", status: "Reading document..." })}\n\n`);
            }

            let fullReply = "";

            await aiService.streamResponse(prepared.conversation, (token) => {
                res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
                fullReply += token;
            });

            // Append Source Citations if document was used
            if (prepared.isDocumentAnswer && prepared.sourceCitations) {
                if (!fullReply.includes("Source:")) {
                    const citationsText = prepared.sourceCitations;
                    fullReply += citationsText;
                    for (const char of citationsText) {
                        res.write(`data: ${JSON.stringify({ type: "token", token: char })}\n\n`);
                    }
                }

                // SSE Status Event: Answer generated from uploaded document
                res.write(`data: ${JSON.stringify({ type: "status", status: "Answer generated from uploaded document." })}\n\n`);
            }

            // Save assistant response
            chat.messages.push({
                role: "assistant",
                content: fullReply
            });

            if (chat.title === "New Chat" && message.trim()) {
                chat.title = message.substring(0, 40);
            }

            await chat.save();

            res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
            res.end();
        } catch (error) {
            console.error("[chat/stream] failed:", error.message);
            res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
            res.end();
        }
    }

    async deleteChat(req, res) {
        try {
            const result = await chatService.deleteChat(req.params.id, req.user._id);
            return res.status(200).json({
                success: true,
                message: "Chat deleted successfully",
                data: result
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ChatController();

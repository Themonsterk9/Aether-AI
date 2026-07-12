const chatService = require("../services/chat/chat.service");
const aiService = require("../services/ai/ai.service");
const memoryService = require("../services/memory/memory.service");

class ChatController {

    async createChat(req, res) {

        try {

            const chat = await chatService.createChat(
                req.user._id
            );

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

        const chats = await chatService.getChats(
            req.user._id
        );

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

        const chat = await chatService.getChat(
            req.params.id,
            req.user._id
        );

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

        console.log("[chat/message] entered", {
            chatId: req.params.id,
            userId: String(req.user?._id),
            message
        });

        const chat = await chatService.sendMessage(
            req.params.id,
            req.user._id,
            message
        );

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: chat
        });

    } catch (error) {

        console.error("[chat/message] failed", {
            chatId: req.params.id,
            userId: String(req.user?._id),
            message: error.message,
            stack: error.stack
        });

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

    async streamMessage(req, res) {

    try {

        const { message } = req.body;

        console.log("[chat/stream] entered", {
            chatId: req.params.id,
            userId: String(req.user?._id),
            message
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const streamStart = Date.now();
        const { chat, conversation } = await chatService.prepareChatStreaming(
            req.params.id,
            req.user._id,
            message
        );
        console.log(`[Database/Context Timing] prepareChatStreaming took ${Date.now() - streamStart}ms`);

        let fullReply = "";
        const aiStart = Date.now();

        await aiService.streamResponse(conversation, (token) => {
            res.write(
                `data: ${JSON.stringify({
                    type: "token",
                    token
                })}\n\n`
            );
            fullReply += token;
        });
        console.log(`[AI Response Stream Timing] ollama stream took ${Date.now() - aiStart}ms`);

        // Save assistant response
        chat.messages.push({
            role: "assistant",
            content: fullReply
        });

        // Update title
        if (
            chat.title === "New Chat" &&
            message.trim()
        ) {
            chat.title = message.substring(0, 40);
        }

        const dbStart = Date.now();
        await chat.save();
        console.log(`[Database Timing] chat.save() took ${Date.now() - dbStart}ms`);

        res.write(
            `data: ${JSON.stringify({
                type: "done"
            })}\n\n`
        );

        res.end();

    } catch (error) {

        console.error("[chat/stream] failed", {
            chatId: req.params.id,
            userId: String(req.user?._id),
            message: error.message,
            stack: error.stack
        });

        res.write(
            `data: ${JSON.stringify({
                type: "error",
                message: error.message
            })}\n\n`
        );

        res.end();

    }

}

    async deleteChat(req, res) {

    try {

        const result = await chatService.deleteChat(
            req.params.id,
            req.user._id
        );

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

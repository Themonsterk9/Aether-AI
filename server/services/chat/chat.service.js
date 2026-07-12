const memoryService = require("../memory/memory.service");
const embeddingService = require("../embeddings/embedding.service");
const learningService = require("../learning/learning.service");
const Chat = require("../../models/chat.model");
const aiService = require("../ai/ai.service");

class ChatService {

    async createChat(userId) {

        const chat = await Chat.create({
            user: userId,
            title: "New Chat",
            messages: []
        });

        return chat;

    }

    async getChats(userId) {

        return await Chat.find({
            user: userId
        }).sort({
            updatedAt: -1
        });

    }

    async getChat(chatId, userId) {

        const chat = await Chat.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            throw new Error("Chat not found");
        }

        return chat;

    }

    async sendMessage(chatId, userId, message) {

        console.log("[ChatService.sendMessage] entered", {
            chatId,
            userId: String(userId),
            message
        });

        const chat = await Chat.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            throw new Error("Chat not found");
        }

        // Save user message
        chat.messages.push({
            role: "user",
            content: message
        });

        // Extract memory
        const extractedMemory =
            await memoryService.extractMemory(message);

        console.log("[ChatService.sendMessage] memory extracted", {
            userId: String(userId),
            extractedMemory
        });

        // Save memory if new
        const savedMemory = await memoryService.saveExtractedMemory(
            userId,
            extractedMemory
        );

        console.log("[ChatService.sendMessage] memory save result", {
            userId: String(userId),
            memoryId: savedMemory?._id?.toString() || null
        });

        // Learn from explicit teaching
        if (
            learningService.shouldLearn(message)
        ) {

            await learningService.learn(
                userId,
                message,
                "user"
            );

        }

        // Build memory context
        const memoryContext =
            await memoryService.buildMemoryContext(
                userId
            );

        console.log("MEMORY CONTEXT");
        console.log(memoryContext);

        // Retrieve document knowledge (RAG)
        const relevantChunks =
            await embeddingService.searchRelevantChunks(
                userId,
                message
            );

        // Retrieve learned knowledge
        const learnedKnowledge =
            await learningService.searchLearnedKnowledge(
                userId,
                message
            );

        // Build knowledge context
        const knowledgeContext =
            relevantChunks.length === 0
                ? ""
                : relevantChunks
                    .map(item => item.chunk)
                    .join("\n\n");

        console.log("KNOWLEDGE CONTEXT");
        console.log(knowledgeContext);

        // Build learning context
        const learningContext =
            learnedKnowledge.length === 0
                ? ""
                : learnedKnowledge
                    .map(item => item.content)
                    .join("\n\n");

        const conversation = [];

        let systemPrompt = "";

        if (memoryContext) {

            systemPrompt +=
`Long-term user memories:

${memoryContext}

`;

        }

        if (knowledgeContext) {

            systemPrompt +=
`Relevant knowledge retrieved from the knowledge base:

${knowledgeContext}

`;

        }

        if (learningContext) {

            systemPrompt +=
`Learned knowledge:

${learningContext}

`;

        }

        systemPrompt +=
`You are Aether AI, a friendly and intelligent AI assistant.

Use long-term memories when they are relevant.

Use the retrieved knowledge base when answering questions about uploaded documents.

Use learned knowledge when it is relevant.

If the retrieved knowledge is not relevant, answer normally.

Do not invent information that is not supported by the retrieved knowledge when the user is asking about uploaded documents.`;

        conversation.push({
            role: "system",
            content: systemPrompt
        });

        conversation.push(
            ...chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        );

        // Generate AI response
        console.log("SYSTEM PROMPT");
        console.log(systemPrompt);

        const assistantReply =
            await aiService.generateResponse(
                conversation
            );

        // Save assistant response
        chat.messages.push({
            role: "assistant",
            content: assistantReply
        });

        // Update title
        if (
            chat.title === "New Chat" &&
            message.trim()
        ) {

            chat.title = message.substring(0, 40);

        }

        await chat.save();

        return {
            chatId: chat._id,
            assistant: assistantReply,
            messages: chat.messages
        };

    }

    async prepareChatStreaming(chatId, userId, message) {
        const chat = await Chat.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            throw new Error("Chat not found");
        }

        // Save user message
        chat.messages.push({
            role: "user",
            content: message
        });

        // Extract memory
        const extractedMemory = await memoryService.extractMemory(message);

        // Save memory if new
        await memoryService.saveExtractedMemory(userId, extractedMemory);

        // Learn from explicit teaching
        if (learningService.shouldLearn(message)) {
            await learningService.learn(userId, message, "user");
        }

        // Build memory context
        const memoryContext = await memoryService.buildMemoryContext(userId);

        // Retrieve document knowledge (RAG)
        const relevantChunks = await embeddingService.searchRelevantChunks(userId, message);

        // Retrieve learned knowledge
        const learnedKnowledge = await learningService.searchLearnedKnowledge(userId, message);

        // Build knowledge context
        const knowledgeContext = relevantChunks.length === 0
            ? ""
            : relevantChunks.map(item => item.chunk).join("\n\n");

        // Build learning context
        const learningContext = learnedKnowledge.length === 0
            ? ""
            : learnedKnowledge.map(item => item.content).join("\n\n");

        let systemPrompt = "";

        if (memoryContext) {
            systemPrompt += `Long-term user memories:\n\n${memoryContext}\n\n`;
        }

        if (knowledgeContext) {
            systemPrompt += `Relevant knowledge retrieved from the knowledge base:\n\n${knowledgeContext}\n\n`;
        }

        if (learningContext) {
            systemPrompt += `Learned knowledge:\n\n${learningContext}\n\n`;
        }

        systemPrompt += `You are Aether AI, a friendly and intelligent AI assistant.

Use long-term memories when they are relevant.

Use the retrieved knowledge base when answering questions about uploaded documents.

Use learned knowledge when it is relevant.

If the retrieved knowledge is not relevant, answer normally.

Do not invent information that is not supported by the retrieved knowledge when the user is asking about uploaded documents.`;

        const conversation = [
            {
                role: "system",
                content: systemPrompt
            },
            ...chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        return {
            chat,
            conversation
        };
    }

    async deleteChat(chatId, userId) {

        const chat = await Chat.findOneAndDelete({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            throw new Error("Chat not found");
        }

        return {
            deleted: true
        };

    }

}

module.exports = new ChatService();

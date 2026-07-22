const memoryService = require("../memory/memory.service");
const embeddingService = require("../embeddings/embedding.service");
const learningService = require("../learning/learning.service");
const Chat = require("../../models/chat.model");
const User = require("../../models/User.model");
const Setting = require("../../models/Setting.model");
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
        return await Chat.find({ user: userId }).sort({ updatedAt: -1 });
    }

    async getChat(chatId, userId) {
        const chat = await Chat.findOne({ _id: chatId, user: userId });
        if (!chat) {
            throw new Error("Chat not found");
        }
        return chat;
    }

    formatSourceCitations(chunks) {
        if (!chunks || chunks.length === 0) return "";
        const seen = new Set();
        const citations = [];

        chunks.forEach((item) => {
            const fileName = item.fileName || "Uploaded Document";
            const page = item.page || 1;
            const chunkIdx = item.chunkIndex ?? 0;
            const key = `${fileName}-p${page}-c${chunkIdx}`;

            if (!seen.has(key)) {
                seen.add(key);
                citations.push(`- ${fileName} (Page ${page}, Chunk ${chunkIdx})`);
            }
        });

        if (citations.length === 0) return "";
        return `\n\n**Source:**\n${citations.join("\n")}`;
    }

    async prepareChatStreaming(chatId, userId, message) {
        const chat = await Chat.findOne({ _id: chatId, user: userId });
        if (!chat) {
            throw new Error("Chat not found");
        }

        // Save user message
        chat.messages.push({
            role: "user",
            content: message
        });

        // Get user setting / documentMode
        const userDoc = await User.findById(userId);
        const userSetting = await Setting.findOne({ user: userId });
        const documentMode = userDoc?.documentMode || userSetting?.documentMode || "automatic";

        // Priority 1: Search Uploaded Documents
        const relevantChunks = await embeddingService.searchRelevantChunks(userId, message, 5);
        const topScore = relevantChunks.length > 0 ? relevantChunks[0].score : 0;
        const hasDocumentMatch = relevantChunks.length > 0 && topScore >= 0.35;

        // ==========================================
        // STRICT DOCUMENT MODE
        // ==========================================
        if (documentMode === "strict") {
            if (!hasDocumentMatch) {
                return {
                    chat,
                    isStrictFallback: true,
                    fallbackReply: "I couldn't find this information in your uploaded documents."
                };
            }

            const documentContext = relevantChunks
                .map((item) => `[Doc: ${item.fileName || "Document"} | Page: ${item.page || 1} | Chunk: ${item.chunkIndex ?? 0}]\n${item.chunk}`)
                .join("\n\n");

            const sourceCitations = this.formatSourceCitations(relevantChunks);

            const strictSystemPrompt = `You are Aether AI operating in STRICT DOCUMENT MODE.

UPLOADED DOCUMENT EXCERPTS (PRIMARY & ONLY KNOWLEDGE SOURCE):

${documentContext}

STRICT MODE INSTRUCTIONS:
- You MUST answer the user's question using ONLY the provided uploaded document excerpts above.
- Do NOT use long-term memories, learned knowledge, or outside general Gemini knowledge.
- If the uploaded document excerpts do not contain enough information to answer the question, state clearly: "I couldn't find this information in your uploaded documents."
- Never hallucinate or invent information outside the uploaded document excerpts.`;

            const conversation = [
                { role: "system", content: strictSystemPrompt },
                ...chat.messages.map((msg) => ({ role: msg.role, content: msg.content }))
            ];

            return {
                chat,
                conversation,
                isDocumentAnswer: true,
                sourceCitations
            };
        }

        // ==========================================
        // AUTOMATIC DOCUMENT MODE
        // ==========================================
        // Extract Memory
        const extractedMemory = await memoryService.extractMemory(message);
        await memoryService.saveExtractedMemory(userId, extractedMemory);

        // Explicit Learning
        if (learningService.shouldLearn(message)) {
            await learningService.learn(userId, message, "user");
        }

        // Priority 2: Long-Term Memory
        const memoryContext = await memoryService.buildMemoryContext(userId);

        // Priority 3: Learning Engine
        const learnedKnowledge = await learningService.searchLearnedKnowledge(userId, message);
        const learningContext = learnedKnowledge.length === 0
            ? ""
            : learnedKnowledge.map((item) => item.content).join("\n\n");

        let documentContext = "";
        let sourceCitations = "";

        if (hasDocumentMatch) {
            documentContext = relevantChunks
                .map((item) => `[Doc: ${item.fileName || "Document"} | Page: ${item.page || 1} | Chunk: ${item.chunkIndex ?? 0}]\n${item.chunk}`)
                .join("\n\n");

            sourceCitations = this.formatSourceCitations(relevantChunks);
        }

        let systemPrompt = `You are Aether AI, a highly capable AI assistant.\n\n`;

        if (hasDocumentMatch) {
            systemPrompt += `PRIMARY UPLOADED DOCUMENTS KNOWLEDGE (HIGHEST PRIORITY):\n\n${documentContext}\n\n`;
            systemPrompt += `CRITICAL INSTRUCTIONS:\n- The user has uploaded documents. Always answer using uploaded documents first.\n- If the uploaded documents contain the answer, do not ignore them.\n- If multiple uploaded documents contain relevant information, combine them.\n- If the document only partially answers, combine with Memory and Learning to provide a complete response.\n- Never hallucinate document content.\n\n`;
        }

        if (memoryContext) {
            systemPrompt += `Priority 2 - Long-Term User Memories:\n\n${memoryContext}\n\n`;
        }

        if (learningContext) {
            systemPrompt += `Priority 3 - Learned Knowledge:\n\n${learningContext}\n\n`;
        }

        if (!hasDocumentMatch) {
            systemPrompt += `No relevant uploaded document excerpts were found for this query. Answer using Memory, Learning, and general Gemini knowledge naturally.\n\n`;
        }

        const conversation = [
            { role: "system", content: systemPrompt },
            ...chat.messages.map((msg) => ({ role: msg.role, content: msg.content }))
        ];

        return {
            chat,
            conversation,
            isDocumentAnswer: hasDocumentMatch,
            sourceCitations
        };
    }

    async sendMessage(chatId, userId, message) {
        const prepared = await this.prepareChatStreaming(chatId, userId, message);
        const { chat } = prepared;

        if (prepared.isStrictFallback) {
            chat.messages.push({
                role: "assistant",
                content: prepared.fallbackReply
            });
            await chat.save();
            return {
                chatId: chat._id,
                assistant: prepared.fallbackReply,
                messages: chat.messages
            };
        }

        let assistantReply = await aiService.generateResponse(prepared.conversation);

        if (prepared.isDocumentAnswer && prepared.sourceCitations) {
            if (!assistantReply.includes("Source:")) {
                assistantReply += prepared.sourceCitations;
            }
        }

        chat.messages.push({
            role: "assistant",
            content: assistantReply
        });

        if (chat.title === "New Chat" && message.trim()) {
            chat.title = message.substring(0, 40);
        }

        await chat.save();

        return {
            chatId: chat._id,
            assistant: assistantReply,
            messages: chat.messages
        };
    }

    async deleteChat(chatId, userId) {
        const chat = await Chat.findOneAndDelete({ _id: chatId, user: userId });
        if (!chat) {
            throw new Error("Chat not found");
        }
        return { deleted: true };
    }
}

module.exports = new ChatService();

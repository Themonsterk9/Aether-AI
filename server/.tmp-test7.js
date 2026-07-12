require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const User = require("./models/User.model");
const Memory = require("./models/Memory.model");
const Document = require("./models/Document.model");
const Embedding = require("./models/Embedding.model");
const Chat = require("./models/chat.model");
const embeddingService = require("./services/embeddings/embedding.service");
const memoryService = require("./services/memory/memory.service");
const learningService = require("./services/learning/learning.service");
const app = require("./config/app");

let baseUrl;
let httpServer;
const email = `test7-${Date.now()}@example.test`;
const password = "test7-password";
const teaching = "Remember that my project name is Aether AI.";
const question = "How can MongoDB help with my project?";

const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    if (!response.ok || !body.success) {
        throw new Error(`${path}: ${body.message || response.statusText}`);
    }
    return body;
};

const streamMessage = async (chatId, headers, message) => {
    const response = await fetch(`${baseUrl}/chat/${chatId}/stream`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message })
    });
    return { ok: response.ok, body: await response.text() };
};

(async () => {
    await connectDatabase();
    app.use("/api/v1", require("./routes"));
    httpServer = await new Promise(resolve => {
        const server = app.listen(0, "127.0.0.1", () => resolve(server));
    });
    baseUrl = `http://127.0.0.1:${httpServer.address().port}/api/v1`;

    await request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test 7", email, password })
    });
    const login = await request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const userId = login.data.user.id;
    const headers = { Authorization: `Bearer ${login.data.token}` };

    const memoryChat = await request("/chat", { method: "POST", headers });
    const memoryStream = await streamMessage(memoryChat.data._id, headers, teaching);
    const memory = await Memory.findOne({ user: userId, key: "current_project", value: "Aether AI" }).lean();

    const form = new FormData();
    form.append("document", new Blob([fs.readFileSync(".tmp-test7-mongodb.txt")], { type: "text/plain" }), "mongodb-guidance-test7.txt");
    const upload = await request("/documents/upload", { method: "POST", headers, body: form });
    const documentId = upload.data.documentId;
    const document = await Document.findById(documentId).lean();
    const documentEmbeddings = await Embedding.find({ document: documentId }).lean();

    const questionChat = await request("/chat", { method: "POST", headers });
    const retrieval = await embeddingService.searchRelevantChunks(userId, question);
    const memoryContext = await memoryService.buildMemoryContext(userId);
    const learnedKnowledge = await learningService.searchLearnedKnowledge(userId, question);
    const answerStream = await streamMessage(questionChat.data._id, headers, question);
    const refreshedChat = await request(`/chat/${questionChat.data._id}`, { headers });
    const messages = refreshedChat.data.messages;
    const answer = messages.find(item => item.role === "assistant")?.content || "";

    console.log(JSON.stringify({
        memoryStreamCompleted: memoryStream.ok && memoryStream.body.includes('"type":"done"'),
        memoryCreated: Boolean(memory),
        memoryContext,
        documentUploaded: document?.status === "completed",
        documentTextChunked: upload.data.chunks === 1 && /MongoDB can be Aether AI/.test(documentEmbeddings[0]?.chunk || ""),
        embeddingsGenerated: documentEmbeddings.every(item => item.embedding.length === 768),
        embeddingsStored: documentEmbeddings.length === upload.data.chunks && documentEmbeddings.every(item => String(item.document) === documentId),
        relevantDocumentChunkRetrieved: retrieval.some(item => /MongoDB can be Aether AI/.test(item.chunk)),
        learnedKnowledgeRetrieved: learnedKnowledge.some(item => item.content === teaching),
        newChat: memoryChat.data._id !== questionChat.data._id,
        currentConversationOnly: messages.length === 2 && !messages.some(item => item.content === teaching),
        answerStreamCompleted: answerStream.ok && answerStream.body.includes('"type":"done"'),
        responsePersisted: Boolean(answer),
        answer,
        answerCombinesMemoryAndDocument: /Aether AI/i.test(answer) && /MongoDB/i.test(answer) && /users|chats|memories|documents|embeddings|database/i.test(answer)
    }, null, 2));

    await request(`/documents/${documentId}`, { method: "DELETE", headers });
    await Chat.deleteMany({ user: userId });
    await Memory.deleteMany({ user: userId });
    await Embedding.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });
    await new Promise(resolve => httpServer.close(resolve));
    await mongoose.disconnect();
})().catch(async error => {
    console.error(error);
    if (httpServer) {
        await new Promise(resolve => httpServer.close(resolve));
    }
    await mongoose.disconnect();
    process.exit(1);
});

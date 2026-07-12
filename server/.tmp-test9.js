require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const app = require("./config/app");
const Chat = require("./models/chat.model");
const Memory = require("./models/Memory.model");
const Learning = require("./models/Learning.model");
const Document = require("./models/Document.model");
const Embedding = require("./models/Embedding.model");
const chatService = require("./services/chat/chat.service");
const memoryService = require("./services/memory/memory.service");
const learningService = require("./services/learning/learning.service");
const embeddingService = require("./services/embeddings/embedding.service");
const documentService = require("./services/documents/document.service");

let httpServer;
const email = `test9-${Date.now()}@example.test`;
const password = "test9-password";

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
};

(async () => {
  await connectDatabase();
  app.use("/api/v1", require("./routes"));
  httpServer = await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  baseUrl = `http://127.0.0.1:${httpServer.address().port}/api/v1`;

  const register = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test 9", email, password })
  });
  const login = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const token = login.body.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const chatIds = [];
  for (let i = 0; i < 20; i++) {
    const res = await request("/chat", { method: "POST", headers });
    chatIds.push(res.body.data._id);
  }
  const chats = await request("/chat", { headers });
  const deleted = await request(`/chat/${chatIds[0]}`, { method: "DELETE", headers });

  const documentDir = path.join(__dirname, "uploads");
  fs.mkdirSync(documentDir, { recursive: true });
  const pdfPath = path.join(documentDir, "stress-test.pdf");
  fs.writeFileSync(pdfPath, Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 18 Tf 100 100 Td (Aether AI and MongoDB) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000207 00000 n 
0000000302 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF
`));

  for (let i = 0; i < 10; i++) {
    const form = new FormData();
    const blob = new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" });
    form.append("document", blob, `doc-${i}.pdf`);
    await request("/documents/upload", { method: "POST", headers, body: form });
  }
  const documents = await Document.find({ user: login.body.data.user.id }).lean();

  for (let i = 0; i < 20; i++) {
    await memoryService.saveExtractedMemory(login.body.data.user.id, {
      key: `memory_${i}`,
      value: `memory value ${i}`,
      type: "profile",
      importance: 3
    });
  }
  const memories = await Memory.find({ user: login.body.data.user.id }).lean();

  for (let i = 0; i < 20; i++) {
    await learningService.learn(login.body.data.user.id, `learning entry ${i}`, "user");
  }
  const learnings = await Learning.find({ user: login.body.data.user.id }).lean();

  const streamResults = [];
  for (let i = 0; i < 5; i++) {
    const chat = await request("/chat", { method: "POST", headers });
    const res = await fetch(`${baseUrl}/chat/${chat.body.data._id}/stream`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ message: `Stream test ${i}` })
    });
    const text = await res.text();
    streamResults.push({ ok: res.ok, length: text.length, hasDone: text.includes('"type":"done"') });
  }

  const questionResults = [];
  for (let i = 0; i < 10; i++) {
    const chat = await request("/chat", { method: "POST", headers });
    const res = await request(`/chat/${chat.body.data._id}/message`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: `How can MongoDB help with project ${i}?` }) });
    questionResults.push(res.body.success);
  }

  const memoryContext = await memoryService.buildMemoryContext(login.body.data.user.id);
  const retrieval = await embeddingService.searchRelevantChunks(login.body.data.user.id, "MongoDB help project");
  const learned = await learningService.searchLearnedKnowledge(login.body.data.user.id, "learning entry 0");

  console.log(JSON.stringify({
    chatsCreated: chats.body.data.length,
    chatsDeleted: deleted.body.success,
    documentsStored: documents.length,
    memoriesStored: memories.length,
    learningsStored: learnings.length,
    streamResults,
    questionResults,
    memoryContextLength: memoryContext.length,
    retrievalCount: retrieval.length,
    learnedCount: learned.length,
    duplicateMemories: memories.length - new Set(memories.map((m) => `${m.key}:${m.value}`)).size,
    duplicateLearnings: learnings.length - new Set(learnings.map((m) => m.content)).size,
    duplicateEmbeddings: await Embedding.countDocuments({ user: login.body.data.user.id })
  }, null, 2));

  await Chat.deleteMany({ user: login.body.data.user.id });
  await Memory.deleteMany({ user: login.body.data.user.id });
  await Learning.deleteMany({ user: login.body.data.user.id });
  await Embedding.deleteMany({ user: login.body.data.user.id });
  await Document.deleteMany({ user: login.body.data.user.id });
  await mongoose.disconnect();
  await new Promise((resolve) => httpServer.close(resolve));
})().catch(async (error) => {
  console.error(error);
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await mongoose.disconnect();
  process.exit(1);
});

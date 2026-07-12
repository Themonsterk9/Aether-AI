require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const app = require("./config/app");
const Chat = require("./models/chat.model");
const Memory = require("./models/Memory.model");
const User = require("./models/User.model");

let baseUrl;
let httpServer;

const email = `suite-${Date.now()}@example.test`;
const password = "suite-password";

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  return { response, body };
};

(async () => {
  await connectDatabase();
  app.use("/api/v1", require("./routes"));
  httpServer = await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  baseUrl = `http://127.0.0.1:${httpServer.address().port}/api/v1`;

  // Test 1 auth
  const reg = await request("/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Suite User", email, password }) });
  const login = await request("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const token = login.body.data.token;
  const headers = { Authorization: `Bearer ${token}` };
  const profile = await request("/auth/profile", { headers });
  const logout = await request("/auth/logout", { method: "POST", headers });

  // Test 2 chat
  const chat1 = await request("/chat", { method: "POST", headers });
  const chat2 = await request("/chat", { method: "POST", headers });
  const chats = await request("/chat", { headers });
  const msgRes = await request(`/chat/${chat1.body.data._id}/message`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "Hello chat" }) });
  const deleted = await request(`/chat/${chat2.body.data._id}`, { method: "DELETE", headers });

  // Test 3 streaming
  const streamChat = await request("/chat", { method: "POST", headers });
  const streamRes = await fetch(`${baseUrl}/chat/${streamChat.body.data._id}/stream`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ message: "Explain what Artificial Intelligence is." })
  });
  const streamText = await streamRes.text();
  const fetchedChat = await request(`/chat/${streamChat.body.data._id}`, { headers });

  // Test 4 memory
  const memoryChat = await request("/chat", { method: "POST", headers });
  const memoryRes = await request(`/chat/${memoryChat.body.data._id}/message`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "My favorite programming language is JavaScript." }) });
  const newChat = await request("/chat", { method: "POST", headers });
  const memoryQ = await request(`/chat/${newChat.body.data._id}/message`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "What is my favorite programming language?" }) });
  const memories = await Memory.find({ user: login.body.data.user.id }).lean();

  console.log(JSON.stringify({
    registration: reg.body,
    login: login.body,
    profile: profile.body,
    logout: logout.body,
    chatCreate: chat1.body,
    chatList: chats.body,
    messagePersist: msgRes.body,
    chatDelete: deleted.body,
    streamStatus: streamRes.status,
    streamHasDone: streamText.includes('"type":"done"'),
    streamSaved: fetchedChat.body.data.messages.some((m) => m.role === "assistant"),
    memoryExtracted: memories.some((m) => m.key === "favorite_programming_language"),
    memorySaved: memories.some((m) => m.value === "JavaScript"),
    memoryQuestionSuccess: memoryQ.body.success
  }, null, 2));

  await Chat.deleteMany({ user: login.body.data.user.id });
  await Memory.deleteMany({ user: login.body.data.user.id });
  await User.deleteOne({ _id: login.body.data.user.id });
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

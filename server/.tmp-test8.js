require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const app = require("./config/app");
const User = require("./models/User.model");

let baseUrl;
let httpServer;

const email = `test8-${Date.now()}@example.test`;
const password = "test8-password";

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  return { response, body };
};

(async () => {
  await connectDatabase();
  app.use("/api/v1", require("./routes"));
  httpServer = await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  baseUrl = `http://127.0.0.1:${httpServer.address().port}/api/v1`;

  await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test 8", email, password })
  });

  const login = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const token = login.body.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const invalidJwtResult = await request("/documents", { headers: { Authorization: "Bearer invalid.token" } });
  const missingFileResult = await request("/documents/upload", { method: "POST", headers });
  const unsupportedFileResult = await (async () => {
    const form = new FormData();
    const blob = new Blob(["not a real file"], { type: "application/octet-stream" });
    form.append("document", blob, "test.exe");
    return request("/documents/upload", { method: "POST", headers: { ...headers }, body: form });
  })();

  const invalidDocGetResult = await request("/documents/123", { headers });
  const invalidDocDeleteResult = await request("/documents/123", { method: "DELETE", headers });
  const invalidChatGetResult = await request("/chat/123", { headers });
  const invalidChatMessageResult = await request("/chat/123/message", { method: "POST", headers, body: JSON.stringify({ message: "hello" }) });
  const invalidChatDeleteResult = await request("/chat/123", { method: "DELETE", headers });

  console.log(JSON.stringify({
    invalidJwt: {
      status: invalidJwtResult.response.status,
      body: invalidJwtResult.body
    },
    missingFile: {
      status: missingFileResult.response.status,
      body: missingFileResult.body
    },
    unsupportedFile: {
      status: unsupportedFileResult.response.status,
      body: unsupportedFileResult.body
    },
    invalidDocGet: {
      status: invalidDocGetResult.response.status,
      body: invalidDocGetResult.body
    },
    invalidDocDelete: {
      status: invalidDocDeleteResult.response.status,
      body: invalidDocDeleteResult.body
    },
    invalidChatGet: {
      status: invalidChatGetResult.response.status,
      body: invalidChatGetResult.body
    },
    invalidChatMessage: {
      status: invalidChatMessageResult.response.status,
      body: invalidChatMessageResult.body
    },
    invalidChatDelete: {
      status: invalidChatDeleteResult.response.status,
      body: invalidChatDeleteResult.body
    }
  }, null, 2));

  await User.deleteOne({ email });
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error);
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await mongoose.disconnect();
  process.exit(1);
});

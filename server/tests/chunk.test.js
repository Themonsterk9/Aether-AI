const documentService = require("../services/documents/document.service");

const text = `
Artificial Intelligence is transforming software development.

Large Language Models can answer questions.

Retrieval Augmented Generation combines search with LLMs.

MongoDB stores documents.

Ollama runs models locally.

`;

const chunks = documentService.chunkText(
    text,
    60,
    20
);

console.log(chunks);
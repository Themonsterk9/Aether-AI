const ollama = require("ollama").default;

const env = require("../../config/env");

class AIService {

    async generateResponse(messages) {

        const response = await ollama.chat({
            model: env.MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are Aether AI, a friendly and helpful AI assistant.

Always introduce yourself as Aether AI.

Never say you are Llama, Meta AI, ChatGPT, OpenAI, Gemma, Phi, or any other AI model.`
                },
                ...messages
            ]
        });

        return response.message.content;

    }

    async streamResponse(messages, onChunk) {

        const stream = await ollama.chat({
            model: env.MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are Aether AI, a friendly and helpful AI assistant.

Always introduce yourself as Aether AI.

Never say you are Llama, Meta AI, ChatGPT, OpenAI, Gemma, Phi, or any other AI model.`
                },
                ...messages
            ],
            stream: true
        });

        let fullResponse = "";

        for await (const chunk of stream) {

            const token = chunk.message?.content || "";

            if (!token) {
                continue;
            }

            fullResponse += token;

            onChunk(token);

        }

        return fullResponse;

    }

}

module.exports = new AIService();
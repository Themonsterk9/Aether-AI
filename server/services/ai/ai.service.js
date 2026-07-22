const { GoogleGenAI } = require("@google/genai");
const env = require("../../config/env");

async function executeWithRetry(fn) {
    try {
        return await fn();
    } catch (error) {
        console.warn("[AIService] Request failed, retrying once. Error:", error.message);
        try {
            return await fn();
        } catch (retryError) {
            console.error("[AIService] Retry failed. Error:", retryError.message);
            throw retryError;
        }
    }
}

function getFriendlyError(error) {
    const msg = (error.message || "").toLowerCase();
    
    if (msg.includes("api key") || msg.includes("apikey") || msg.includes("invalid key") || msg.includes("key not found")) {
        return new Error("Invalid Gemini API Key. Please verify your GEMINI_API_KEY configuration.");
    }
    if (msg.includes("quota") || msg.includes("limit") || msg.includes("429") || msg.includes("rate")) {
        return new Error("Gemini API rate limit or quota exceeded. Please try again later.");
    }
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout") || msg.includes("connect") || msg.includes("econn")) {
        return new Error("Network timeout or connection error. Please check your internet connectivity.");
    }
    
    return new Error(`Aether AI is currently experiencing service issues. Please try again.`);
}

class AIService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        this.modelName = env.MODEL || "gemini-2.5-flash";
    }

    prepareGeminiParams(messages) {
        const systemPrompts = [];
        
        systemPrompts.push(`You are Aether AI, a friendly and helpful AI assistant.

Always introduce yourself as Aether AI.

Never say you are Llama, Meta AI, ChatGPT, OpenAI, Gemma, Phi, or any other AI model.`);

        const contents = [];
        for (const msg of messages) {
            if (msg.role === "system") {
                if (msg.content) {
                    systemPrompts.push(msg.content);
                }
            } else {
                const role = msg.role === "assistant" ? "model" : "user";
                contents.push({
                    role: role,
                    parts: [{ text: msg.content || "" }]
                });
            }
        }

        return {
            systemInstruction: systemPrompts.join("\n\n"),
            contents: contents
        };
    }

    async generateResponse(messages) {
        const { systemInstruction, contents } = this.prepareGeminiParams(messages);

        const callApi = async () => {
            return await this.ai.models.generateContent({
                model: this.modelName,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction
                }
            });
        };

        try {
            const response = await executeWithRetry(callApi);
            return response.text || "";
        } catch (error) {
            throw getFriendlyError(error);
        }
    }

    async streamResponse(messages, onChunk) {
        const { systemInstruction, contents } = this.prepareGeminiParams(messages);

        const callApi = async () => {
            return await this.ai.models.generateContentStream({
                model: this.modelName,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction
                }
            });
        };

        try {
            const stream = await executeWithRetry(callApi);
            let fullResponse = "";

            for await (const chunk of stream) {
                const token = chunk.text || "";
                if (token) {
                    fullResponse += token;
                    onChunk(token);
                }
            }

            return fullResponse;
        } catch (error) {
            throw getFriendlyError(error);
        }
    }
}

module.exports = new AIService();
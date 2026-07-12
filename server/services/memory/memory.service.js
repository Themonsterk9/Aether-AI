const Memory = require("../../models/Memory.model");

const normalizeMemoryValue = (value) =>
    value.trim().replace(/[.!?]+$/, "").trim();

class MemoryService {

    async createMemory(userId, memory) {

        console.log("[memory.create] creating", {
            userId: String(userId),
            memory
        });

        try {
            const createdMemory = await Memory.create({
                user: userId,
                ...memory
            });

            console.log("[memory.create] saved", {
                memoryId: createdMemory._id.toString(),
                userId: String(createdMemory.user),
                key: createdMemory.key,
                value: createdMemory.value
            });

            return createdMemory;
        } catch (error) {
            console.error("[memory.create] failed", {
                userId: String(userId),
                memory,
                message: error.message,
                stack: error.stack
            });

            throw error;
        }

    }

    async getMemories(userId) {

        return await Memory.find({
            user: userId
        }).sort({
            importance: -1,
            updatedAt: -1
        });

    }

    async extractMemory(message) {

    console.log("[memory.extract] checking message", { message });

    const text = message.trim();

    // My name is...
    const nameMatch = text.match(/^my name is (.+)$/i);

    if (nameMatch) {
        return {
            type: "profile",
            key: "name",
            value: normalizeMemoryValue(nameMatch[1]),
            importance: 5
        };
    }

    // I'm building...
    const projectMatch = text.match(/^i('| a)?m building (.+)$/i);

    if (projectMatch) {
        return {
            type: "project",
            key: "current_project",
            value: normalizeMemoryValue(projectMatch[2]),
            importance: 5
        };
    }

    // Remember that my project name is...
    const rememberedProjectMatch =
        text.match(/^remember that my project name is (.+)$/i);

    if (rememberedProjectMatch) {
        return {
            type: "project",
            key: "current_project",
            value: normalizeMemoryValue(rememberedProjectMatch[1]),
            importance: 5
        };
    }

    // I prefer...
    const preferenceMatch = text.match(/^i prefer (.+)$/i);

    if (preferenceMatch) {
        return {
            type: "preference",
            key: "preference",
            value: normalizeMemoryValue(preferenceMatch[1]),
            importance: 4
        };
    }

    // My favorite programming language is...
    const languageMatch =
        text.match(/^my favorite programming language is (.+)$/i);

    if (languageMatch) {
        return {
            type: "preference",
            key: "favorite_programming_language",
            value: normalizeMemoryValue(languageMatch[1]),
            importance: 5
        };
    }

    // My favorite color is...
    const colorMatch =
        text.match(/^my favorite color is (.+)$/i);

    if (colorMatch) {
        return {
            type: "preference",
            key: "favorite_color",
            value: normalizeMemoryValue(colorMatch[1]),
            importance: 4
        };
    }

    // My favorite food is...
    const foodMatch =
        text.match(/^my favorite food is (.+)$/i);

    if (foodMatch) {
        return {
            type: "preference",
            key: "favorite_food",
            value: normalizeMemoryValue(foodMatch[1]),
            importance: 4
        };
    }

    // I live in...
    const locationMatch =
        text.match(/^i live in (.+)$/i);

    if (locationMatch) {
        return {
            type: "profile",
            key: "location",
            value: normalizeMemoryValue(locationMatch[1]),
            importance: 4
        };
    }

    return null;

}

    async saveExtractedMemory(userId, memory) {

    console.log("[memory.save] received", {
        userId: String(userId),
        memory
    });

    if (!memory) {
        console.log("[memory.save] skipped: no extractable memory");
        return null;
    }

    const existing = await Memory.findOne({
        user: userId,
        key: memory.key,
        value: memory.value
    });

    console.log("[memory.save] duplicate lookup complete", {
        userId: String(userId),
        existingMemoryId: existing?._id?.toString() || null
    });

    if (existing) {
        console.log("[memory.save] skipped: duplicate memory", {
            memoryId: existing._id.toString()
        });
        return existing;
    }

    console.log("[memory.save] no duplicate; creating memory");

    return await this.createMemory(userId, memory);

}

    async buildMemoryContext(userId) {

    console.log("[memory.context] loading memories", {
        userId: String(userId)
    });

    const memories = await Memory.find({
        user: userId
    })
    .sort({
        importance: -1,
        updatedAt: -1
    })
    .limit(20);

    console.log("Retrieved Memories");
    console.log(memories);

    console.log("[memory.context] memories loaded", {
        userId: String(userId),
        count: memories.length
    });

    if (memories.length === 0) {
        return "";
    }

    return memories
        .map(memory =>
            `${memory.key}: ${memory.value}`
        )
        .join("\n");

}

    async deleteMemory(memoryId, userId) {

        return await Memory.findOneAndDelete({
            _id: memoryId,
            user: userId
        });

    }

}

module.exports = new MemoryService();

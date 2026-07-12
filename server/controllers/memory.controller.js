const memoryService = require("../services/memory/memory.service");

class MemoryController {

    async getMemories(req, res) {

        try {

            const memories = await memoryService.getMemories(
                req.user._id
            );

            return res.status(200).json({
                success: true,
                data: memories
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async createMemory(req, res) {

        try {

            const memory = await memoryService.createMemory(
                req.user._id,
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "Memory created successfully",
                data: memory
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

    }

    async deleteMemory(req, res) {

        try {

            await memoryService.deleteMemory(
                req.params.id,
                req.user._id
            );

            return res.status(200).json({
                success: true,
                message: "Memory deleted successfully"
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

    }

}

module.exports = new MemoryController();
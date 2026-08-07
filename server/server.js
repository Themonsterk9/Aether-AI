require("dotenv").config();

const env = require("./config/env");
const app = require("./config/app");

// Database
const connectDatabase = require("./config/database");

// Middlewares
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");

// Root & Health check endpoints
app.get("/", (req, res) => {
    res.json({
        success: true,
        project: "Aether AI",
        version: "1.0.0",
        status: "Running",
        endpoints: {
            health: "/health",
            apiV1: "/api/v1",
            auth: "/api/v1/auth",
            chat: "/api/v1/chat"
        }
    });
});

app.get("/health", (req, res) => {
    const { dbManager } = require("./config/database");
    const health = dbManager.getHealthStatus();

    if (!health.success) {
        return res.status(503).json({
            success: false,
            database: health.database,
            status: "disconnected"
        });
    }

    return res.json({
        success: true,
        database: health.database,
        status: "connected"
    });
});

// Mounted API Routes — supports /api/v1, /api, and root level aliases for maximum compatibility
const apiRoutes = require("./routes");
app.use("/api/v1", apiRoutes);
app.use("/api", apiRoutes);
app.use("/auth", require("./routes/auth.routes"));
app.use("/chat", require("./routes/chat.routes"));

// Middlewares (MUST be after all routes)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || env.PORT || 5002;

const startServer = async () => {
    try {
        // Connect Database
        await connectDatabase();

        // Start Express Server
        app.listen(PORT, () => {
            console.log("======================================");
            console.log("Aether AI Server");
            console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
            console.log(`Server running on port ${PORT}`);
            console.log("======================================");
        });

    } catch (error) {
        console.error("======================================");
        console.error("Failed to start Aether AI");
        console.error(error.message);
        console.error("======================================");
        process.exit(1);
    }
};

startServer();

// Graceful Shutdown
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("Shutting down server...");
    process.exit(0);
});
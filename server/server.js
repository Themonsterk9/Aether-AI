require("dotenv").config();

const env = require("./config/env");
const app = require("./config/app");

// Database
const connectDatabase = require("./config/database");

// Middlewares
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");

// Routes
app.use("/api/v1", require("./routes"));

// Middlewares
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
            console.log("Aether AI");
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
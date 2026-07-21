const mongoose = require("mongoose");
const dns = require("dns");
const env = require("./env");

// Force IPv4 result order & public Google/Cloudflare DNS servers to resolve Atlas SRV records reliably on Windows
try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
    // Ignore if not supported in older Node environments
}

class DatabaseManager {
    constructor() {
        this.activeDatabase = "none"; // "atlas" | "local" | "none"
        this.isConnecting = false;
        this.retryDelay = 1000;
        this.maxRetryDelay = 30000;
        this.retryTimer = null;

        this._setupEventListeners();
        this._setupGracefulShutdown();
    }

    _setupEventListeners() {
        mongoose.connection.on("connected", () => {
            if (this.activeDatabase !== "none") {
                console.log(`[Database Event] Connected to ${this.activeDatabase.toUpperCase()} MongoDB.`);
            }
        });

        mongoose.connection.on("disconnected", () => {
            if (this.activeDatabase !== "none") {
                console.warn(`[Database Event] Disconnected from ${this.activeDatabase.toUpperCase()} MongoDB.`);
            }
        });

        mongoose.connection.on("reconnected", () => {
            if (this.activeDatabase !== "none") {
                console.log(`[Database Event] Reconnected to ${this.activeDatabase.toUpperCase()} MongoDB.`);
            }
        });

        mongoose.connection.on("error", (err) => {
            if (err.message && !err.message.includes("ECONNREFUSED")) {
                console.error(`[Database Event Error] MongoDB Connection Error: ${err.message}`);
            }
        });

        mongoose.connection.on("close", () => {
            console.log("[Database Event] Connection closed.");
        });
    }

    _setupGracefulShutdown() {
        const shutdownHandler = async (signal) => {
            console.log(`\n[Database] Received ${signal}. Closing MongoDB connection gracefully...`);
            try {
                if (this.retryTimer) clearTimeout(this.retryTimer);
                await mongoose.connection.close();
                console.log("[Database] Mongoose connection closed successfully.");
            } catch (err) {
                console.error("[Database Shutdown Error]:", err.message);
            } finally {
                process.exit(0);
            }
        };

        process.once("SIGINT", () => shutdownHandler("SIGINT"));
        process.once("SIGTERM", () => shutdownHandler("SIGTERM"));
    }

    _getConnectionOptions() {
        return {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            maxPoolSize: 10,
            minPoolSize: 2,
            family: 4
        };
    }

    async connect() {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (this.isConnecting) {
            return;
        }

        this.isConnecting = true;

        const isProduction = env.NODE_ENV === "production";
        const primaryUri = env.MONGODB_URI;
        const localUri = env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/aetherai";

        if (isProduction) {
            await this._connectProduction(primaryUri);
        } else {
            await this._connectDevelopment(primaryUri, localUri);
        }

        this.isConnecting = false;
        return mongoose.connection;
    }

    async _connectDevelopment(primaryUri, localUri) {
        console.log("Connecting to MongoDB Atlas...");

        try {
            this.activeDatabase = "atlas";
            const connection = await mongoose.connect(primaryUri, this._getConnectionOptions());
            console.log("✓ Connected to MongoDB Atlas");
            console.log(`Database : ${connection.connection.name}`);
            return connection;
        } catch (atlasError) {
            console.log("✗ Atlas connection failed");
            console.log("Switching to Local MongoDB...");

            try {
                this.activeDatabase = "local";
                const localConnection = await mongoose.connect(localUri, this._getConnectionOptions());
                console.log("✓ Connected to Local MongoDB");
                console.log(`Database : ${localConnection.connection.name}`);
                return localConnection;
            } catch (localError) {
                this.activeDatabase = "none";
                console.error("✗ Failed to connect to both Atlas and Local MongoDB.");
                console.error("Primary Error :", atlasError.message);
                console.error("Local Error   :", localError.message);
            }
        }
    }

    async _connectProduction(primaryUri) {
        console.log("Connecting to MongoDB Atlas...");

        try {
            this.activeDatabase = "atlas";
            const connection = await mongoose.connect(primaryUri, this._getConnectionOptions());
            this.retryDelay = 1000;
            console.log("✓ Connected to MongoDB Atlas");
            return connection;
        } catch (error) {
            this.activeDatabase = "none";
            console.log("✗ Connection failed");
            console.log(`Retrying in ${this.retryDelay / 1000} ${this.retryDelay === 1000 ? "second" : "seconds"}...`);

            this.retryTimer = setTimeout(() => {
                this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
                this._connectProduction(primaryUri);
            }, this.retryDelay);
        }
    }

    getHealthStatus() {
        const state = mongoose.connection.readyState;
        const isConnected = state === 1;

        return {
            success: isConnected,
            database: isConnected ? this.activeDatabase : "none",
            status: isConnected ? "connected" : "disconnected"
        };
    }

    async disconnect() {
        if (this.retryTimer) clearTimeout(this.retryTimer);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            this.activeDatabase = "none";
        }
    }
}

const dbManager = new DatabaseManager();

const connectDatabase = async () => {
    return await dbManager.connect();
};

module.exports = connectDatabase;
module.exports.dbManager = dbManager;
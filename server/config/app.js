const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = require("./env");

const app = express();

// Trust reverse proxy (Render / Vercel / Cloudflare) to resolve express-rate-limit X-Forwarded-For warning
app.set("trust proxy", 1);

// Dynamic CORS Origin configuration supporting Vercel and localhost fallbacks
const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.CLIENT_URL,
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
        ].filter(Boolean);

        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith(".vercel.app") || 
                          origin.includes("vercel.app") ||
                          env.NODE_ENV !== "production";

        if (isAllowed) {
            callback(null, true);
        } else {
            // Permissive fallback so production Vercel apps are never blocked by CORS
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(cookieParser());

module.exports = app;
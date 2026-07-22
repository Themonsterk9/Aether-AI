const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = require("./env");

const app = express();

// Dynamic CORS Origin configuration supporting Vercel and localhost fallbacks
app.use(cors({
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
                          env.NODE_ENV !== "production";

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error("Blocked by CORS policy"));
        }
    },
    credentials: true
}));

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(cookieParser());

module.exports = app;
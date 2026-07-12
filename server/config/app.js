const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = require("./env");

const app = express();

// Hardened CORS Origin configuration
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
    origin: env.NODE_ENV === "production" ? allowedOrigin : true,
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
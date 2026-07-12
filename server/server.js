const env = require("./config/env");

const app = require("./config/app");

// database connection
const connectDatabase = require("./config/database");

// middlewares
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");

connectDatabase();

app.use("/api/v1", require("./routes"));

app.use(notFoundMiddleware);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log("======================================");
    console.log("Aether AI");
    console.log(`Environment : ${env.NODE_ENV}`);
    console.log(`Server      : http://localhost:${env.PORT}`);
    console.log("======================================");
});
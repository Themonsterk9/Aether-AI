const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
    try {
        const connection = await mongoose.connect(env.MONGODB_URI);

        console.log("======================================");
        console.log("MongoDB Connected Successfully");
        console.log(`Database : ${connection.connection.name}`);
        console.log(`Host     : ${connection.connection.host}`);
        console.log("======================================");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDatabase;
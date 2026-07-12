const mongoose = require("mongoose");

const connectDB = require("../config/database");

const learningService = require("../services/learning/learning.service");

(async () => {

    await connectDB();

    const result =
        await learningService.learn(
            "6a4ea1498fdf6932596f45a9",
            "Our preferred database is MongoDB."
        );

    console.log(result);

    mongoose.disconnect();

})();
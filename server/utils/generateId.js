const { v4: uuid } = require("uuid");

const generateId = () => {
    return uuid();
};

module.exports = generateId;
const loggerMiddleware = (req, res, next) => {
    next();
};

module.exports = loggerMiddleware;
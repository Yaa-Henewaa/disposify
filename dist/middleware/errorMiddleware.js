"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    try {
        const parsedError = JSON.parse(err.message);
        res.status(statusCode).json({
            error: parsedError,
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
    }
    catch (e) {
        res.status(statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
    }
};
exports.errorHandler = errorHandler;

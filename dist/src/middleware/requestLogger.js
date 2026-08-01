"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.assignRequestId = void 0;
const morgan_1 = __importDefault(require("morgan"));
const crypto_1 = require("crypto");
const logger_1 = require("../config/logger");
const assignRequestId = (req, _res, next) => {
    req.requestId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    next();
};
exports.assignRequestId = assignRequestId;
exports.morganMiddleware = (0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => logger_1.logger.http(message.trim()),
    },
});

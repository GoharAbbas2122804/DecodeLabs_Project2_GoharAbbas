"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const db_1 = require("./config/db");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`==================================================`);
    logger_1.logger.info(`🧠 Project 2: The Nervous System API is Operational`);
    logger_1.logger.info(`📡 Environment: ${env_1.env.NODE_ENV}`);
    logger_1.logger.info(`🚀 Listening on: http://localhost:${env_1.env.PORT}`);
    logger_1.logger.info(`📚 Swagger Documentation: http://localhost:${env_1.env.PORT}/api/v1/docs`);
    logger_1.logger.info(`==================================================`);
});
// Graceful Shutdown Handling
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
        logger_1.logger.info('HTTP server closed.');
        await db_1.prisma.$disconnect();
        logger_1.logger.info('Prisma database connection closed.');
        process.exit(0);
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

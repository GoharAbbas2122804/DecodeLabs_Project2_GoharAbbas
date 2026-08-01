import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/db';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🧠 Project 2: The Nervous System API is Operational`);
  logger.info(`📡 Environment: ${env.NODE_ENV}`);
  logger.info(`🚀 Listening on: http://localhost:${env.PORT}`);
  logger.info(`📚 Swagger Documentation: http://localhost:${env.PORT}/api/v1/docs`);
  logger.info(`==================================================`);
});

// Graceful Shutdown Handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Prisma database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

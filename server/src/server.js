import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`SMRUTI backend server running on http://localhost:${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down server...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

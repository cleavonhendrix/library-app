// filepath: /c:/Users/Cleavon/Documents/Personal Projects/library-app/src/server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bookRoutes from './routes/bookRoutes';
import { PORT } from './config/env';
import logger from './utils/logger';

const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Use the routes defined in bookRoutes.ts
app.use('/api', bookRoutes);

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}.`);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});
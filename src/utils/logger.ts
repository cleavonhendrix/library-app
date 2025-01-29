import { createLogger, format, transports } from 'winston';
import path from 'path';
import { LOG_LEVEL, LOG_DIR } from '../config/env';
import fs from 'fs';

const { combine, timestamp, printf, colorize, errors } = format;

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack ? `\nStack trace: ${stack}` : ''}`;
});

const logger = createLogger({
    level: LOG_LEVEL,
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // Capture stack trace
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(LOG_DIR, 'combined.log') })
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join(LOG_DIR, 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(LOG_DIR, 'rejections.log') })
    ]
});

export default logger;
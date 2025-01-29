import sqlite3 from 'sqlite3';
import logger from './logger';
import { SQLITE_DB_PATH } from '../config/env';

const db = new sqlite3.Database(SQLITE_DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logger.error(`Failed to connect to the database: ${err.message}`);
    } else {
        logger.info('Connected to the database.');
    }
});

export const testDbConnection = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT 1', (err) => {
            if (err) {
                logger.error(`Database connection test failed: ${err.message}`);
                reject(new Error('Database connection test failed'));
            } else {
                logger.info('Database connection test succeeded.');
                resolve();
            }
        });
    });
};

export default db;
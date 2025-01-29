import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || 'sqlite://path/to/database.db';
export const OPENLIBRARY_URL = process.env.OPENLIBRARY_URL || 'https://openlibrary.org';
export const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './lib.db';

export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const LOG_DIR = process.env.LOG_DIR || 'logs';

export const MISSING_FIELDS = 'Missing required field/s: ';
export const BOOK_NOT_FOUND = 'Book not found';
export const AUTHOR_NOT_FOUND = 'Author not found';
export const BOOK_DELETED = 'Book deleted successfully';
export const AUTHOR_FOUND = 'Author found';
export const BOOK_FOUND = 'Book found';
export const BOOK_RETRIEVED = 'Book/s retrieved successfully';
export const BOOK_ADDED = 'Book added successfully';
export const BOOK_UPDATED = 'Book updated successfully';

export const BAD_REQUEST = 'Bad Request';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error';

export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
import axios from 'axios';
import { validationResult } from 'express-validator';
import { BookQuery, BookDetails } from '../models/bookModel';
import { Result } from '../models/resultModel';
import { AUTHOR_FOUND, AUTHOR_NOT_FOUND, BAD_REQUEST, BOOK_ADDED, BOOK_DELETED, BOOK_FOUND, BOOK_NOT_FOUND, BOOK_RETRIEVED, BOOK_UPDATED, FAILED, INTERNAL_SERVER_ERROR, MISSING_FIELDS, OPENLIBRARY_URL, SUCCESS } from '../config/env';
import logger from '../utils/logger';
import db from '../utils/dbUtils';

const getBooks = (query: BookQuery): Promise<Result<BookDetails[]>> => {
    return new Promise((resolve, reject) => {
        const { bookTitle, author, yearPublished, isbn, genre, series, limit = 10, offset = 0 } = query;
        const fields: string[] = [];
        const params: (string | number)[] = [];
        let sql: string = '';
        if (bookTitle || author || yearPublished || isbn || genre || series) {
            if (bookTitle) {
                fields.push('booktitle LIKE ?');
                params.push(`%${bookTitle}%`);
            }
            if (author) {
                fields.push('author LIKE ?');
                params.push(`%${author}%`);
            }
            if (yearPublished) {
                fields.push('yearpublished LIKE ?');
                params.push(`%${yearPublished}%`);
            }
            if (isbn) {
                fields.push('isbn LIKE ?');
                params.push(`%${isbn}%`);
            }
            if (genre) {
                fields.push('genre LIKE ?');
                params.push(`%${genre}%`);
            }
            if (series) {
                fields.push('series LIKE ?');
                params.push(`%${series}%`);
            }
            params.push(limit);
            params.push(offset);
            sql = `SELECT * FROM books WHERE ${fields.join(' OR ')} LIMIT ? OFFSET ?`;
        } else {
            sql = `SELECT * FROM books ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`;
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject({ status: FAILED, code: (err as any).code || 500, message: err.message || INTERNAL_SERVER_ERROR });
            }
            const message = rows.length === 0 ? BOOK_NOT_FOUND : BOOK_RETRIEVED;
            resolve({ status: SUCCESS, code: 200, message: message, data: rows as BookDetails[], limit: limit, offset: offset, total: rows.length });
        });
    });
};

const insertBookToDB = (bookDtls: BookDetails): Promise<Result<{ id: number }>> => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: FAILED, code: 400, message: BAD_REQUEST, errors: errors.array() });
        }
        const { bookTitle, author, yearPublished, isbn, genre, series } = bookDtls;
        const requiredFields = [];
        if(!bookTitle) {
            requiredFields.push('bookTitle');
        }
        if(!author) {
            requiredFields.push('author');
        }
        if(requiredFields.length > 0) {
            return reject({ status: FAILED, code: 400, message: MISSING_FIELDS + requiredFields.join(', ')});
        }
        const seriesStr = Array.isArray(series) ? series.join(', ') : series;
        const now = new Date(Date.now());
        const sql = `INSERT INTO books (booktitle, author, yearpublished, isbn, genre, series, datecreated) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [bookTitle, author, yearPublished, isbn, genre, seriesStr, now.toISOString()];

        db.run(sql, params, function (err) {
            if (err) {
                return reject({ status: FAILED, code: (err as any).code || 500, message: err.message || INTERNAL_SERVER_ERROR });
            }
            resolve({ status: SUCCESS, code: 201, message: BOOK_ADDED, data: { id: this.lastID } });
        });
    });
};

const updateBook = (isbn: string, bookDtls: BookDetails): Promise<Result<null>> => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: FAILED, code: 400, message: BAD_REQUEST, errors: errors.array() });
        }
        if (!isbn) {
            return reject({ status: FAILED, code: 400, message: MISSING_FIELDS + 'isbn' });
        }
        const fields: string[] = [];
        const params: (string | number)[] = [];
        if (bookDtls.bookTitle) {
            fields.push('booktitle = ?');
            params.push(bookDtls.bookTitle);
        }
        if (bookDtls.author) {
            fields.push('author = ?');
            params.push(bookDtls.author);
        }
        if (bookDtls.yearPublished) {
            fields.push('yearpublished = ?');
            params.push(bookDtls.yearPublished);
        }
        if (bookDtls.genre) {
            fields.push('genre = ?');
            params.push(bookDtls.genre);
        }
        if (bookDtls.series) {
            const seriesStr = Array.isArray(bookDtls.series) ? bookDtls.series.join(', ') : bookDtls.series;
            fields.push('series = ?');
            params.push(seriesStr);
        }
        fields.push('datemodified = ?');
        params.push(new Date(Date.now()).toISOString());
        params.push(isbn);

        const sql = `UPDATE books SET ${fields.join(', ')} WHERE isbn = ?`;
        db.run(sql, params, function (err) {
            if (err) {
                return reject({ status: FAILED, code: (err as any).code || 500, message: err.message || INTERNAL_SERVER_ERROR });
            }
            resolve({ status: SUCCESS, code: 200, message: BOOK_UPDATED });
        });
    });
};

const deleteBook = (isbn: string): Promise<Result<null>> => {
    return new Promise((resolve, reject) => {
        if (!isbn) {
            return reject({ status: FAILED, code: 400, message: MISSING_FIELDS + 'isbn' });
        }
        const sql = 'DELETE FROM books WHERE isbn = ?';
        db.run(sql, isbn, function (err) {
            if (err) {
                return reject({ status: FAILED, code: (err as any).code || 500, message: err.message || INTERNAL_SERVER_ERROR });
            }
            if (this.changes === 0) {
                return reject({ status: FAILED, code: 404, message: BOOK_NOT_FOUND });
            }
            resolve({ status: SUCCESS, code: 200, message:BOOK_DELETED });
        });
    });
};

const restGetAuthor = (path: string): Promise<Result<any>> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!path) {
                return reject({ status: FAILED, code: 400, message: MISSING_FIELDS + 'path' });
            }
            const url = `${OPENLIBRARY_URL}${path}.json`;
            const response = await axios.get(url);
            logger.info(JSON.stringify(response.data));
            if (response.data) {
                resolve({ status: SUCCESS, code: 200, message: AUTHOR_FOUND, data: response.data });
            } else {
                reject({ status: FAILED, code: 404, message: AUTHOR_NOT_FOUND });
            }
        } catch (error: any) {
            console.error(error);
            reject({ status: FAILED, code: error.status || 500, message: error.message || INTERNAL_SERVER_ERROR });
        }
    });
};

const restGetBookByISBN = (isbn: string): Promise<Result<BookDetails>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `${OPENLIBRARY_URL}/isbn/${isbn}.json`;
            const response = await axios.get(url);
            logger.info(JSON.stringify(response.data));
            if (response.data) {
                let author: Result<any> = { status: FAILED, code: 404, message: AUTHOR_NOT_FOUND };
                if (response.data.authors) {
                    author = await restGetAuthor(response.data.authors[0].key);
                }
                const bookDtls: BookDetails = {
                    bookTitle: response.data.title,
                    author: author.data?.name || "",
                    yearPublished: response.data.publish_date?.substring(response.data.publish_date.length - 4) || "",
                    isbn: response.data.isbn_13 ? response.data.isbn_13[0] : isbn,
                    genre: response.data.genre || "",
                    series: response.data.series || ""
                };

                resolve({ status: SUCCESS, code: 200, message: BOOK_FOUND, data: bookDtls });
            } else {
                reject({ status: FAILED, code: 404, message: BOOK_NOT_FOUND });
            }
        } catch (error: any) {
            console.error(error);
            reject({ status: FAILED, code: error.status || 500, message: error.message || INTERNAL_SERVER_ERROR });
        }
    });
};

export {
    getBooks,
    insertBookToDB,
    updateBook,
    deleteBook,
    restGetBookByISBN,
    restGetAuthor
};
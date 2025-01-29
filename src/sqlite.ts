import sqlite3 from 'sqlite3';
import { validationResult } from 'express-validator';
import { BookQuery, BookDetails } from './models/bookModel';
import { Result } from './models/resultModel';

const db = new sqlite3.Database('./lib.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

const getBooks = (query: BookQuery): Promise<Result<BookDetails[]>> => {
    const { bookTitle, author, yearPublished, isbn, genre, series, limit = 10, offset = 0 } = query;
    const fields: string[] = [];
    const params: (string | number)[] = [];
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

        const sql = `SELECT * FROM books WHERE ${fields.join(' OR ')} LIMIT ? OFFSET ?`;

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    return reject({ status: 'FAILED', code: 500, message: 'Internal Server Error', errors: err });
                }
                const message = rows.length === 0 ? 'No books found' : 'Book retrieval successful.';
                resolve({ status: 'SUCCESS', code: 200, message: message, data: rows as BookDetails[], limit: limit, offset: offset, total: rows.length });
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM books ORDER BY id ASC LIMIT ? OFFSET ?';
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    return reject({ status: 'FAILED', code: 500, message: 'Internal Server Error', errors: err });
                }
                resolve({ status: 'SUCCESS', code: 200, message: 'Book retrieval successful', data: rows as BookDetails[], limit: limit, offset: offset, total: rows.length });
            });
        });
    }
};

const insertBookToDB = (bookDtls: BookDetails): Promise<Result<{ id: number }>> => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: 'FAILED', code: 400, message: 'Bad Request', errors: errors.array() });
        }

        try {
            const { bookTitle, author, yearPublished, isbn, genre, series } = bookDtls;
            const seriesStr = Array.isArray(series) ? series.join(', ') : series;

            const now = new Date(Date.now());
            const sql = `INSERT INTO books (booktitle, author, yearpublished, isbn, genre, series, datecreated) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [bookTitle, author, yearPublished, isbn, genre, seriesStr, now.toISOString()];

            db.run(sql, params, function (err) {
                if (err) {
                    return reject({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
                }
                resolve({ status: 'SUCCESS', code: 201, message: 'Book inserted successfully', data: { id: this.lastID } });
            });
        } catch (error) {
            console.error(error);
            reject({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    });
};

const updateBook = (isbn: string, bookDtls: BookDetails): Promise<Result<null>> => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: 'FAILED', code: 400, message: 'Bad Request', errors: errors.array() });
        }

        try {
            if (!isbn) {
                return reject({ status: 'FAILED', code: 400, message: 'Missing required field: isbn' });
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

            const sql = `UPDATE books SET ${fields.join(', ')} WHERE isbn = ?`;
            params.push(isbn);

            db.run(sql, params, function (err) {
                if (err) {
                    return reject({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
                }
                resolve({ status: 'SUCCESS', code: 200, message: 'Book updated successfully' });
            });
        } catch (error) {
            console.error(error);
            reject({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    });
};

const deleteBook = (isbn: string): Promise<Result<null>> => {
    return new Promise((resolve, reject) => {
        if (!isbn) {
            return reject({ status: 'FAILED', code: 400, message: 'Missing required field: isbn' });
        }

        const sql = 'DELETE FROM books WHERE isbn = ?';
        db.run(sql, isbn, function (err) {
            if (err) {
                return reject({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
            }
            if (this.changes === 0) {
                return reject({ status: 'FAILED', code: 404, message: 'Book not found' });
            }
            resolve({ status: 'SUCCESS', code: 200, message: 'Book deleted successfully' });
        });
    });
}

export {
    getBooks,
    insertBookToDB,
    updateBook,
    deleteBook
};
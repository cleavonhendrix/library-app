const sqlite3 = require('sqlite3').verbose();
const { validationResult } = require('express-validator');

const db = new sqlite3.Database('./lib.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

const getBooks = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM books ORDER BY id ASC';
        db.all(sql, (err, rows) => {
            if (err) {
                return reject({ status: 'FAILED', code: 500, message: 'Bad Request', errors: err.array() });
            }
            resolve({ status: 'SUCCESS', code: 200, message: 'Book retrieval successfully', data: rows });
        });
    });
};

const insertBookToDB = (req) => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return reject({ status: 'FAILED', code: 400, message: 'Bad Request', errors: errors.array() });
        }

        try {
            const { bookTitle, author, yearPublished, isbn, genre, series } = req.body;
            if (!bookTitle || !author || !yearPublished || !isbn) {
                return reject({ status: 'FAILED', code: 400, message: 'Missing required fields' });
            }

            // Normalize series to be a string
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

const updateBook = (id, bookDtls) => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: 'FAILED', code: 400, message: 'Bad Request', errors: errors.array() });
        }

        try {
            const { bookTitle, author, yearPublished, isbn, genre, series } = bookDtls;
            if (!id) {
                return reject({ status: 'FAILED', code: 400, message: 'Missing required field: id' });
            }

            const fields = [];
            const params = [];

            if (bookTitle) {
                fields.push('booktitle = ?');
                params.push(bookTitle);
            }
            if (author) {
                fields.push('author = ?');
                params.push(author);
            }
            if (yearPublished) {
                fields.push('yearpublished = ?');
                params.push(yearPublished);
            }
            if (isbn) {
                fields.push('isbn = ?');
                params.push(isbn);
            }
            if (genre) {
                fields.push('genre = ?');
                params.push(genre);
            }
            if (series) {
                const seriesStr = Array.isArray(series) ? series.join(', ') : series;
                fields.push('series = ?');
                params.push(seriesStr);
            }

            fields.push('datemodified = ?');
            params.push(new Date(Date.now()).toISOString());

            const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
            params.push(id);

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

const deleteBookById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM books WHERE id = ?';
        db.all(sql, id, (err, rows) => {
            if (err) {
                return reject({ status: 'FAILED', code: 500, message: 'Bad Request', errors: err.array() });
            }
            resolve({ status: 'SUCCESS', code: 200, message: 'Book deleted successfully' });
        });
    });
};

module.exports = {
    getBooks,
    insertBookToDB,
    updateBook,
    deleteBookById
};
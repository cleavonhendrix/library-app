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
                return reject(err);
            }
            resolve(rows);
        });
    });
};

const insertBookToDB = (bookDtls) => {
    return new Promise((resolve, reject) => {
        const errors = validationResult(bookDtls);
        if (!errors.isEmpty()) {
            return reject({ status: 'SUCCESS', code: 400, message: 'Bad Request', errors: errors.array() });
        }

        try {
            const { bookTitle, author, yearPublished, isbn, genre, series } = bookDtls;
            if (!bookTitle || !author || !yearPublished || !isbn) {
                return reject({ status: 'FAILED', code: 400, message: 'Missing required fields' });
            }
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

module.exports = {
    getBooks,
    insertBookToDB
};
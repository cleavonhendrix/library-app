const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
});

const getBooks = (req, res) => {
    let response = {};
    const sql = 'SELECT * FROM library.books ORDER BY id ASC';
    pool.query(sql, (err, result) => {
        try {
            if (err) {
                throw err;
            } else {
                response.status = true;
                response.code = 200;
                response.message = 'Success';
                response.data = result.rows;

                res.status(200).json(response);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json('Internal Server Error');
        }
    });
}

const insertBook = (req, res) => {
    console.log(req);
    let now = new Date(Date.now());
    let response = {};
    const sql = `INSERT INTO library.books (booktitle, author, yearpublished, isbn, genre, series, datecreated) 
    VALUES ('${req.bookTitle.replace("'","''") || ""}','${req.author || ""}','${req.yearPublished || ""}','${req.isbn || ""}','${req.genre || ""}','${req.series || ""}','${now.toISOString()}')`;
    console.log(sql);
    pool.query(sql, (err, result) => {
        try {
            if (err) {
                throw err;
            } else {
                response.status = true;
                response.code = 200;
                response.message = 'Success';
                response.data = result.rows;

                return response;
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    });
}

module.exports = {
    getBooks,
    insertBook
}
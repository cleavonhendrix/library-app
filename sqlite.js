const sqlite3 = require('sqlite3').verbose();
let sql;

const db = new sqlite3.Database('./lib.db',sqlite3.OPEN_READWRITE, (err) => {
    if(err) return console.error(err.message);
});

const getBooks = (req, res) => {
    let response = {};
    sql = 'SELECT * FROM books ORDER BY id ASC';
    db.all(sql,(err, rows) => {
        try {
            if (err) {
                throw err;
            } else {
                response.status = true;
                response.code = 200;
                response.message = 'Success';
                response.data = rows;

                res.status(200).json(response);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json('Internal Server Error');
        }
    });
}

async function insertBook(req) {
    console.log(req);
    let now = new Date(Date.now());
    sql = `INSERT INTO books (booktitle, author, yearpublished, isbn, genre, series, datecreated) 
    VALUES ('${req.bookTitle.replace("'","''") || ""}','${req.author || ""}','${req.yearPublished || ""}','${req.isbn || ""}','${req.genre || ""}','${req.series || ""}','${now.toISOString()}')`;
    db.run(sql, (err, rows) => {
        if (err) {
            console.log('error occured: ' + err.message);
            return err;
        } else {
            return rows;
        }
    });
}

module.exports = {
    getBooks,
    insertBook
}
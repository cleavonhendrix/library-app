const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");

const app = express();

const PORT = 8080;
const db = require('./queries');
const sqlite = require('./sqlite');
const rest = require('./restClient');

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
    response.json({
        info: 'Hello world!'
    });
});

app.get('/books', sqlite.getBooks);
app.get('/books/:isbn', rest.findBookByISBN);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
const axios = require('axios');
const db = require('./sqlite');

const openLibrary = {
    hostname: 'https://openlibrary.org'
}

const findBookByISBN = async (req, res) => {
    try {
        let result = {};
        // console.log(req.params);
        const url = openLibrary.hostname + `/isbn/${req.params.isbn}.json`
        const response = await axios.get(url);
        if (response.data) {
            let author = {};
            // console.log(response.data.authors);
            if(response.data.authors) {
                author = await findAuthor(response.data.authors[0].key);
            }
            result.bookTitle = response.data.title;
            result.author = author.name || "";
            result.yearPublished = response.data.publish_date.substring(response.data.publish_date.length - 4);
            result.isbn = response.data.isbn_13[0];
            result.genre = response.data.genre;
            result.series = response.data.series;

            await db.insertBook(result);
        } else {
            res.status(404).send('Book not found');
        }
    } catch (err) {
        console.log('error occured.');
        console.error(err);
        res.status(500).send('Error fetching data from Open Library');
    }
}

const findAuthor = async (path) => {
    try {
        const url = openLibrary.hostname + `${path}.json`
        const response = await axios.get(url);
        if (response.data) {
            return response.data;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = {
    findBookByISBN
}
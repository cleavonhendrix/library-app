const axios = require('axios');
const db = require('./sqlite');

const openLibrary = {
    hostname: 'https://openlibrary.org'
};

const findAuthor = (path) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `${openLibrary.hostname}${path}.json`;
            const response = await axios.get(url);

            if (response.data) {
                resolve({ status: 'SUCCESS', code: 200, message: 'Author found', data: response.data });
            } else {
                reject({ status: 'FAILED', code: 404, message: 'Author not found' });
            }
        } catch (err) {
            console.error('Error fetching author data:', err);
            reject({ status: 'FAILED', code: err.response.status || 500, message: err.response.statusText || 'Internal Server Error' });
        }
    });
};

const findBookByISBN = (isbn) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `${openLibrary.hostname}/isbn/${isbn}.json`;
            const response = await axios.get(url);

            if (response.data) {
                let author = null;
                if (response.data.authors) {
                    author = await findAuthor(response.data.authors[0].key);
                }
                const bookDtls = {
                    bookTitle: response.data.title,
                    author: author.name || "",
                    yearPublished: response.data.publish_date.substring(response.data.publish_date.length - 4),
                    isbn: response.data.isbn_13 ? response.data.isbn_13[0] : isbn,
                    genre: response.data.genre || "",
                    series: Array.isArray(response.data.series) ? response.data.series.join(', ') : response.data.series || ""
                };
                resolve({ status: 'SUCCESS', code: 200, message: 'Book found', data: bookDtls });
            } else {
                reject({ status: 'FAILED', code: 404, message: 'Book not found' });
            }
        } catch (err) {
            console.error('Error fetching data from Open Library:', err);
            reject({ status: 'FAILED', code: err.response.status || 500, message: err.response.statusText || 'Internal Server Error' });
        }
    });
};

module.exports = {
    findBookByISBN,
    findAuthor
};
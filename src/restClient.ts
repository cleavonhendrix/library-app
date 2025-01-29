import axios from 'axios';
import { BookDetails } from './models/bookModel';
import { Result } from './models/resultModel';

const openLibrary = {
    hostname: 'https://openlibrary.org'
};

const findAuthor = async (path: string) => {
    try {
        const url = `${openLibrary.hostname}${path}.json`;
        const response = await axios.get(url);

        if (response.data) {
            return response.data;
        } else {
            return {};
        }
    } catch (err) {
        console.error('Error fetching author data:', err);
        return {};
    }
};

const findBookByISBN = async (isbn: string): Promise<Result<BookDetails>> => {
    try {
        const url = `${openLibrary.hostname}/isbn/${isbn}.json`;
        const response = await axios.get(url);

        if (response.data) {
            let author = null;
            if (response.data.authors) {
                author = await findAuthor(response.data.authors[0].key);
            }
            const bookDtls: BookDetails = {
                bookTitle: response.data.title,
                author: author ? author.name : "",
                yearPublished: response.data.publish_date?.substring(response.data.publish_date.length - 4) || "",
                isbn: response.data.isbn_13 ? response.data.isbn_13[0] : isbn,
                genre: response.data.genre || "",
                series: response.data.series || ""
            };

            return { status: 'SUCCESS', code: 200, message: 'Book found', data: bookDtls };
        } else {
            return { status: 'FAILED', code: 404, message: 'Book not found' };
        }
    } catch (err) {
        console.error('Error fetching data from Open Library:', err);
        return { status: 'FAILED', code: 500, message: 'Error fetching data from Open Library' };
    }
};

export {
    findBookByISBN,
    findAuthor
};
const express = require('express');
const router = express.Router();
const sqlite = require('./sqlite');
const restClient = require('./restClient');

router.get('/books', async (_req, res) => {
    try {
        const result = await sqlite.getBooks();
        res.status(200).json({ status: true, code: 200, message: 'Success', data: result });
    } catch (error) {
        console.error(error);
        res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
    }
});

router.post('/books/:isbn', async (req, res) => {
    try {
        const bookDtls = await restClient.findBookByISBN(req.params.isbn);
        const result = await sqlite.insertBookToDB(bookDtls.data);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
    }
});

router.get('/books/:isbn', async (req, res) => {
    try {
        const result = await restClient.findBookByISBN(req.params.isbn);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
    }
});

router.patch('/books/:id', async (req, res) => {
    try {
        const result = await sqlite.updateBook(req.params.id, req.body);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
    }
});

router.delete('/books/:id', async (req, res) => {
    try {
        const result = await sqlite.deleteBookById(req.params.id);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
    }
});

module.exports = router;
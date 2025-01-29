import express, { Request, Response } from 'express';
import { deleteBook, getBooks, insertBookToDB, updateBook } from './sqlite';
import { ErrorResult } from './models/resultModel';
import { findBookByISBN } from './restClient';
import { BookDetails } from './models/bookModel';

const router = express.Router();

router.get('/books', async (req: Request, res: Response) => {
    try {
        const result = await getBooks(req.query);
        res.status(200).json(result);
    } catch (error: ErrorResult | any) {
        console.error(error);
        if (error) {
            res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
        } else {
            res.status(500).json({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    }
});

router.post('/books/:isbn', async (req: Request, res: Response) => {
    try {
        const book = await findBookByISBN(req.params.isbn);
        if (book.code === 200 && book.data) {
            const bookDtls: BookDetails = book.data;
            const result = await insertBookToDB(bookDtls);
            res.status(result.code).json(result);
        } else {
            res.status(404).json({ status: 'FAILED', code: 404, message: 'Book data not found' });
        }
    } catch (error: ErrorResult | any) {
        console.error(error);
        if (error) {
            res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
        } else {
            res.status(500).json({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    }
});

router.patch('/books/:isbn', async (req: Request, res: Response) => {
    try {
        const result = await updateBook(req.params.isbn, req.body);
        res.status(result.code).json(result);
    } catch (error: ErrorResult | any) {
        console.error(error);
        if (error) {
            res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
        } else {
            res.status(500).json({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    }
});

router.get('/books/:isbn', async (req: Request, res: Response) => {
    try {
        const result = await findBookByISBN(req.params.isbn);
        res.status(result.code).json(result);
    } catch (error: ErrorResult | any) {
        console.error(error);
        if (error) {
            res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
        } else {
            res.status(500).json({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    }
});

router.delete('/books/:isbn', async (req: Request, res: Response) => {
    try {
        const result = await deleteBook(req.params.isbn);
        res.status(result.code).json(result);
    } catch (error: ErrorResult | any) {
        console.error(error);
        if (error) {
            res.status(error.code || 500).json({ status: 'FAILED', code: error.code || 500, message: error.message || 'Internal Server Error' });
        } else {
            res.status(500).json({ status: 'FAILED', code: 500, message: 'Internal Server Error' });
        }
    }
});

export default router;
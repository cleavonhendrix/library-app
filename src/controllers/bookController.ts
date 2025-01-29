import { Request, Response } from 'express';
import { getBooks, insertBookToDB, updateBook, deleteBook, restGetBookByISBN } from '../services/bookService';
import logger from '../utils/logger';
import { FAILED, INTERNAL_SERVER_ERROR } from '../config/env';

export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const result = await getBooks(req.query);
        res.status(result.code).json(result);
    } catch (error: any) {
        logger.error(error.message);
        res.status(error.code || 500).json({ status: FAILED, code: error.code || 500, message: error.message || INTERNAL_SERVER_ERROR });
    }
};

export const createBook = async (req: Request, res: Response) => {
    try {
        const book = await restGetBookByISBN(req.params.isbn);
        if (book.code === 200 && book.data) {
            const result = await insertBookToDB(book.data);
            res.status(result.code).json(result);
        }else{
            res.status(book.code).json(book);
        }
    } catch (error: any) {
        logger.error(error.message);
        res.status(error.code || 500).json({ status: FAILED, code: error.code || 500, message: error.message || INTERNAL_SERVER_ERROR });
    }
};

export const updateBookById = async (req: Request, res: Response) => {
    try {
        const result = await updateBook(req.params.isbn, req.body);
        res.status(result.code).json(result);
    } catch (error: any) {
        logger.error(error.message);
        res.status(error.code || 500).json({ status: FAILED, code: error.code || 500, message: error.message || INTERNAL_SERVER_ERROR });
    }
};

export const getBookByISBN = async (req: Request, res: Response) => {
    try {
        const result = await restGetBookByISBN(req.params.isbn);
        res.status(result.code).json(result);
    } catch (error: any) {
        logger.error(error.message);
        res.status(error.code || 500).json({ status: FAILED, code: error.code || 500, message: error.message || INTERNAL_SERVER_ERROR });
    }
};

export const deleteBookById = async (req: Request, res: Response) => {
    try {
        const result = await deleteBook(req.params.isbn);
        res.status(result.code).json(result);
    } catch (error: any) {
        logger.error(error.message);
        res.status(error.code || 500).json({ status: FAILED, code: error.code || 500, message: error.message || INTERNAL_SERVER_ERROR });
    }
};
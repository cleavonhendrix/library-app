import express from 'express';
import { getAllBooks, createBook, updateBookById, getBookByISBN, deleteBookById } from '../controllers/bookController';

const router = express.Router();

router.get('/books', getAllBooks);
router.post('/books/:isbn', createBook);
router.patch('/books/:isbn', updateBookById);
router.get('/books/:isbn', getBookByISBN);
router.delete('/books/:isbn', deleteBookById);

export default router;
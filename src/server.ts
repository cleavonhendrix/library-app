import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';

const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Use the routes defined in routes.ts
app.use('/api', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
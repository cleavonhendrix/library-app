const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Your routes here
const routes = require('./routes');

// Use the routes defined in routes.js
app.use('/api', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
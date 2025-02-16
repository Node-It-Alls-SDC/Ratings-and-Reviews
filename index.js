require('dotenv').config()
const express = require('express');
const morgan = require('morgan');

const router = require('./routes.js');
const pool = require('./db/index.js');

const app = express();

// MIDDLEWARE
app.use(express.json());
// Logging
app.use(morgan('dev'));
// Routes
app.use('/', router);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}...`);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Coba endpoint awal
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Portal Berita API' });
});

module.exports = app;

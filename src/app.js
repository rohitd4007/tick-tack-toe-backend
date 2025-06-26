const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Multiplayer Game Backend Running');
});

module.exports = app;

const express = require('express');
const app = express();
const cors = require('cors');

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://tiik-tak-to.netlify.app'
];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Multiplayer Game Backend Running');
});

module.exports = app;

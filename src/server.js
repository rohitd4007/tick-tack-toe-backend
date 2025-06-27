const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const initSocket = require('./config/socket');
require('dotenv').config();

const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://tiik-tak-to.netlify.app'
];

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST']
    },
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const initSocket = require('./config/socket');
require('dotenv').config();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

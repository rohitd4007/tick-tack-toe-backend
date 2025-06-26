const rooms = {}; // roomCode: { players: [socket1, socket2], board, turn }
const socketToRoom = {}; // socket.id → roomCode

function initSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Create room
        socket.on('createRoom', () => {
            const roomCode = generateRoomCode();
            rooms[roomCode] = {
                players: [socket.id],
                board: Array(9).fill(null),
                turn: 0,
            };
            socketToRoom[socket.id] = roomCode;
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
        });

        // Join room
        socket.on('joinRoom', ({ roomCode }) => {
            const room = rooms[roomCode];
            if (!room) return socket.emit('errorMessage', 'Room not found');
            if (room.players.length >= 2) return socket.emit('errorMessage', 'Room is full');

            room.players.push(socket.id);
            socketToRoom[socket.id] = roomCode;
            socket.join(roomCode);

            io.to(roomCode).emit('startGame', {
                roomCode,
                players: room.players,
                currentTurn: room.players[0],
                board: room.board,
            });
        });

        // Make move
        socket.on('makeMove', ({ roomCode, index }) => {
            const room = rooms[roomCode];
            if (!room) return;
            const currentPlayer = room.players[room.turn % 2];
            if (socket.id !== currentPlayer) return;
            if (room.board[index] !== null) return;

            room.board[index] = room.turn % 2 === 0 ? 'X' : 'O';
            room.turn++;

            const winner = checkWinner(room.board);
            if (winner) {
                io.to(roomCode).emit('gameOver', { board: room.board, winner });
                cleanupRoom(roomCode);
            } else {
                io.to(roomCode).emit('updateBoard', {
                    board: room.board,
                    currentTurn: room.players[room.turn % 2],
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            const roomCode = socketToRoom[socket.id];
            if (!roomCode || !rooms[roomCode]) return;

            const room = rooms[roomCode];
            room.players = room.players.filter(id => id !== socket.id);
            delete socketToRoom[socket.id];

            // Notify remaining player
            io.to(roomCode).emit('playerLeft', 'Opponent disconnected. You win by default.');

            // Clean up room if empty
            if (room.players.length === 0) {
                cleanupRoom(roomCode);
            }
        });
    });
}

function cleanupRoom(roomCode) {
    delete rooms[roomCode];
    console.log(`Room ${roomCode} cleaned up.`);
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function checkWinner(board) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of wins) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // 'X' or 'O'
        }
    }
    if (!board.includes(null)) return 'Draw';
    return null;
}

module.exports = initSocket;

const Room = require("../models/RoomModel");

const activeGames = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        let currentRoomId = null;
        let currentUserId = null;
        let gameStarted = null;

        socket.on('joinRoom', async (roomData) => {
            currentRoomId = roomData.roomId;
            currentUserId = roomData.userId;
            let room = await Room.findById(currentRoomId);
            gameStarted = room.status === 'started';
            socket.join(roomData.roomId);
            socket.to(roomData.roomId).emit('updateRoom');
        });

        socket.on('disconnect', async () => {
            if (currentRoomId && !gameStarted) {
                await Room.findByIdAndUpdate({ _id: currentRoomId }, { $pull: { players: currentUserId } }, { new: true });
                socket.leave(currentRoomId);
                socket.to(currentRoomId).emit('updateRoom');
            }
        });

        socket.on('startGame', async (roomId) => {
            gameStarted = true;
            socket.to(roomId).emit('gameStarted');
            io.to(roomId).emit('updateTurn', 0);
        });

        socket.on('gameStartedForAllPlayers', () => {
            gameStarted = true;
        });

        socket.on('endTurn', (gameInfo) => {
            io.to(gameInfo.roomId).emit('updateTurn', gameInfo.turn);
        });
    });
}
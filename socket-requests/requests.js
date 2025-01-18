const Room = require("../models/RoomModel");

module.exports = (io) => {
    io.on('connection', (socket) => {
        let currentRoomId = null;
        let currentUserId = null;

        socket.on('joinRoom', (roomData) => {
            currentRoomId = roomData.roomId;
            currentUserId = roomData.userId;
            socket.join(roomData.roomId);
            socket.to(roomData.roomId).emit('updateRoom');
        });

        socket.on('disconnect', async () => {
            if (currentRoomId) {
                await Room.findByIdAndUpdate({ _id: currentRoomId }, { $pull: { players: currentUserId } }, { new: true });
                socket.leave(currentRoomId);
                socket.to(currentRoomId).emit('updateRoom');
            }
        });

        socket.on('gameStarted', () => {
            socket.to(currentRoomId).emit('updateRoom');
        });
    });
}
const Room = require("../models/RoomModel");

module.exports = (io) => {
    io.on('connection', (socket) => {
        let currentRoom = null;
        let currentRoomId = null;

        socket.on('joinRoom', (room) => {
            currentRoom = room.code;
            currentRoomId = room.id;
            socket.join(room.code);
            socket.to(room.code).emit('updateRoom', '+');
        });

        socket.on('disconnect', async () => {
            if (currentRoom) {
                await Room.findByIdAndUpdate({ _id: currentRoomId }, { $inc: { playersQuantity: -1 } }, { new: true });
                socket.leave(currentRoom);
                socket.to(currentRoom).emit('updateRoom', '-');
            }
        });
    });
}
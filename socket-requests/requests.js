const Room = require("../models/RoomModel");
const _ = require('lodash');

const cardsMaster = [
    'OM1', 'OR1', 'OR2', 'OR3', 'OR4', 'OR5', 'OG1', 'OG2', 'OG3', 'OG4', 'OG5', 'OB1', 'OB2', 'OB3', 'OB4', 'OB5', 'OY1', 'OY2', 'OY3', 'OY4', 'OY5',
    'VM1', 'VR1', 'VR2', 'VR3', 'VR4', 'VG1', 'VG2', 'VG3', 'VG4', 'VB1', 'VB2', 'VB3', 'VB4', 'VY1', 'VY2', 'VY3', 'VY4',
    'TM1', 'TM2', 'TM3', 'TM4', 'TR1', 'TR2', 'TR3', 'TR4', 'TG1', 'TG2', 'TG3', 'TG4', 'TB1', 'TB2', 'TB3', 'TB4', 'TY1', 'TY2', 'TY3', 'TY4',
    'EC1', 'EC2', 'ER1', 'ER2', 'ER3', 'ET1', 'ET2', 'ET3', 'EG1', 'EE1'
];
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

        socket.on('startGame', (roomData) => {
            let cards = _.shuffle(cardsMaster);
            activeGames[roomData.roomId] = {
                deck: cards,
                discardPile: [],
                playerHands: roomData.players.reduce((acc, player) => {
                    acc[player._id] = cards.splice(0, 3);
                    return acc;
                }, {})
            };
            io.to(roomData.roomId).emit('gameStarted');
            io.to(roomData.roomId).emit('updateTurn', 0);
        });

        socket.on('getGameInfo', async () => {
            let room = await Room.findById(currentRoomId);
            gameStarted = room.status === 'started';
            socket.emit('gameInfoResponse', activeGames[currentRoomId]);
        });

        socket.on('playerAction', (data) => {
            let game = activeGames[data.roomId];

            if (game) {
                game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== card);

                if (data.action === 'use') {

                } else if (data.action === 'discard') {
                    game.discardPile.push(card);
                }
                io.to(data.roomId).emit('updateGameState', game);
            }
        });

        socket.on('endTurn', (gameInfo) => {
            io.to(gameInfo.roomId).emit('updateTurn', gameInfo.turn);
        });
    });
}
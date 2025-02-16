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
                }, {}),
                playersBody: roomData.players.reduce((acc, player) => {
                    acc[player._id] = Array.from({ length: 5 }, () => []);
                    return acc;
                }, {}),
                turnState: {
                    hasPlayed: false,
                    hasPlayedAction: false,
                    hasDrawn: false
                },
                winner: null
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
                if (game.turnState.hasPlayed && (data.action === 'use' || game.turnState.hasPlayedAction)) {
                    socket.emit('error', { message: 'Ya jugaste una carta este turno' });
                    return;
                }

                if (game.turnState.hasDrawn) {
                    socket.emit('error', { message: 'Ya robaste cartas en este turno' });
                    return;
                }

                if (data.action === 'use') {
                    if (data.card.slice(0, 1) == 'O') {
                        let verifyCard = data.card.slice(0, 2);
                        let cardInBody = game.playersBody[data.userId].some(slot => 
                            slot.length > 0 && slot[0].slice(0, 2) === verifyCard
                        );
                        if (!cardInBody) {
                            game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                            let firstEmptySlotIndex = game.playersBody[data.userId].findIndex(slot => slot.length === 0);
                            if (firstEmptySlotIndex !== -1) {
                                game.playersBody[data.userId][firstEmptySlotIndex].push(data.card);
                            }
                            game.turnState.hasPlayedAction = true;
                            game.turnState.hasPlayed = true;
                        } else {
                            socket.emit('error', { message: 'No puedes usar una tarjeta que ya está en tu cuerpo' });
                        }
                    } else if (data.card.slice(0, 1) == 'V') {
                        let organCard = game.playersBody[data.targetPlayer][data.slot][0];
                        if (organCard.slice(1, 2) == data.card.slice(1, 2)) {
                            if (game.playersBody[data.targetPlayer][data.slot].length == 1) {
                                game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                                game.playersBody[data.targetPlayer][data.slot].push(data.card);
                                game.turnState.hasPlayedAction = true;
                                game.turnState.hasPlayed = true;
                            } else if (game.playersBody[data.targetPlayer][data.slot].length == 2) {
                                game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                                let slot = game.playersBody[data.targetPlayer][data.slot];
                                let topCard = slot[slot.length - 1];
                                let typeCard = topCard.slice(0, 1);
                                if (typeCard == 'V') {
                                    game.playersBody[data.targetPlayer][data.slot].push(data.card);
                                    const targetBody = game.playersBody[data.targetPlayer][data.slot];
                                    game.discardPile.unshift(...targetBody);
                                    game.playersBody[data.targetPlayer][data.slot] = [];
                                } else {
                                    game.discardPile.unshift(data.card);
                                    game.discardPile.unshift(topCard);
                                    game.playersBody[data.targetPlayer][data.slot].pop();
                                }
                                game.turnState.hasPlayedAction = true;
                                game.turnState.hasPlayed = true;
                            } else if (game.playersBody[data.targetPlayer][data.slot].length == 3) {
                                socket.emit('error', { message: 'No puedes afectar un organo inmunizado' });
                            }
                        } else {
                            socket.emit('error', { message: 'No puedes afectar un organo de otro color' });
                        }
                    } else if (data.card.slice(0, 1) == 'T') {
                        let organCard = game.playersBody[data.userId][data.slot][0];
                        if (organCard.slice(1, 2) == data.card.slice(1, 2)) {
                            if (game.playersBody[data.userId][data.slot].length == 1) {
                                game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                                game.playersBody[data.userId][data.slot].push(data.card);
                                game.turnState.hasPlayedAction = true;
                                game.turnState.hasPlayed = true;
                            } else if (game.playersBody[data.userId][data.slot].length == 2) {
                                game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                                let slot = game.playersBody[data.userId][data.slot];
                                let topCard = slot[slot.length - 1];
                                let typeCard = topCard.slice(0, 1);
                                if (typeCard == 'T') {
                                    game.playersBody[data.userId][data.slot].push(data.card);
                                } else {
                                    game.discardPile.unshift(data.card);
                                    game.discardPile.unshift(topCard);
                                    game.playersBody[data.userId][data.slot].pop();
                                }
                                game.turnState.hasPlayedAction = true;
                                game.turnState.hasPlayed = true;
                            } else if (game.playersBody[data.userId][data.slot].length == 3) {
                                socket.emit('error', { message: 'No puedes tratar a un organo ya inmunizado' });
                            }
                        } else {
                            socket.emit('error', { message: 'No puedes curar un organo de otro color' });
                        }
                    }
                } else if (data.action === 'discard') {
                    game.playerHands[data.userId] = game.playerHands[data.userId].filter(c => c !== data.card);
                    game.discardPile.unshift(data.card);
                    game.turnState.hasPlayed = true;
                }
                io.to(data.roomId).emit('gameInfoResponse', activeGames[currentRoomId]);
            }
        });

        socket.on('getCard', (data) => {
            let game = activeGames[data.roomId];

            if (game) {
                if (!game.turnState.hasPlayed) {
                    socket.emit('error', { message: 'Debes jugar o descartar antes de robar' });
                    return;
                }

                if (game.turnState.hasDrawn) {
                    socket.emit('error', { message: 'Ya robaste cartas en este turno' });
                    return;
                }

                while (game.playerHands[data.userId].length < 3) {
                    if (game.deck.length == 1) {
                        let lastCardDiscard = game.discardPile.shift();
                        game.deck.push(...game.discardPile);
                        game.discardPile = [lastCardDiscard];
                
                        game.deck = _.shuffle(game.deck);
                    }
                    game.playerHands[data.userId].push(game.deck.shift());
                }

                game.turnState.hasDrawn = true;
                io.to(data.roomId).emit('gameInfoResponse', activeGames[currentRoomId]);
            }
        });

        socket.on('endTurn', (gameInfo) => {
            let game = activeGames[gameInfo.roomId];

            if (game) {
                game.turnState.hasPlayed = false;
                game.turnState.hasPlayedAction = false;
                game.turnState.hasDrawn = false;

                for (const playerId in game.playersBody) {
                    const filledSlots = game.playersBody[playerId].filter(slot => slot.length > 0).length;
                    if (filledSlots >= 4) {
                        let slots = game.playersBody[playerId].filter(slot => slot.length > 0);
                        let contador = 0;

                        slots.forEach(slot => {
                            if (slot.length == 1 || slot.length == 3) {
                                contador++;
                            } else {
                                let lastCard = slot[1];

                                if (lastCard.slice(0, 1) == 'T') {
                                    contador++;
                                }
                            }
                        });

                        game.winner = playerId;
                        io.to(gameInfo.roomId).emit('winner', playerId);
                    }
                }
    
                io.to(gameInfo.roomId).emit('updateTurn', gameInfo.turn);
            }
        });
    });
}
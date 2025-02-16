const { Schema, model } = require("mongoose");

const RoomSchema = Schema({
    code: {
        type: String
    },
    admin: {
        type: Schema.ObjectId,
        ref: "User"
    },
    players: [{
        type: Schema.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        default: "waiting"
    },
    currentTurn: {
        type: Number,
        default: 0
    },
    winner: {
        type: Schema.ObjectId,
        ref: "User"
    }
});

module.exports = model("Room", RoomSchema, "rooms");
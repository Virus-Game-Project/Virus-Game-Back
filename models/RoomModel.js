const { Schema, model } = require("mongoose");

const RoomSchema = Schema({
    code: {
        type: String
    },
    admin: {
        type: Schema.ObjectId,
        ref: "User"
    },
    playersQuantity: {
        type: Number,
        default: 0
    }
});

module.exports = model("Room", RoomSchema, "rooms");
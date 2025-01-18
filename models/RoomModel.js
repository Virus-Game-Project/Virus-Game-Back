const { Schema, model } = require("mongoose");

const RoomSchema = Schema({
    code: {
        type: String
    }
});

module.exports = model("Room", RoomSchema, "rooms");
const { Schema, model } = require("mongoose");

const RoomSchema = Schema({
    code: {
        type: String
    },
    admin: {
        type: Schema.ObjectId,
        ref: "User"
    }
});

module.exports = model("Room", RoomSchema, "rooms");
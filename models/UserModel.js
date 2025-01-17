const { Schema, model } = require("mongoose");

const UserSchema = Schema({
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    }
});

module.exports = model("User", UserSchema, "users");
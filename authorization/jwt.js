const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "Secret_Key_Virus_Back_022506";

const createToken = (user) => {
    const payLoad = {
        id: user._id,
        exp: moment().add(30, "days").unix()
    };

    return jwt.encode(payLoad, secret);
}

module.exports = {
    secret,
    createToken
}
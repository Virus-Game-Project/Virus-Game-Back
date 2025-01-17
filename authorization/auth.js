const jwt = require("jwt-simple");
const moment = require("moment");

const libjwt = require("../authorization/jwt");
const secret = libjwt.secret;

exports.auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({
            "message": "Request doesn't have auth header"
        });
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        let payLoad = jwt.decode(token, secret);
        req.user = payLoad;
    } catch {
        return res.status(404).json({
            "message": "Vuelva a iniciar sesión"
        });
    }

    next();
}
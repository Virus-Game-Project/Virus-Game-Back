const User = require("../models/UserModel");

const bcrypt = require("bcrypt");
const libjwt = require("../authorization/jwt");

const register = async (req, res) => {
    let userBody = req.body;

    if (!userBody.name || !userBody.lastName || !userBody.username || !userBody.password) {
        return res.status(400).json({
            "message": "Faltan datos"
        });
    }

    let userData = {
        name: userBody.name,
        lastName: userBody.lastName,
        username: userBody.username,
        password: userBody.password
    }

    try {
        const userAlreadyExist = await User.find({ username: userData.username });

        if (userAlreadyExist.length >= 1) {
            return res.status(400).json({
                "message": "El usuario ya existe"
            });
        }

        userData.password = await bcrypt.hash(userData.password, 10);

        let user_to_save = new User(userData);

        try {
            const userStored = await user_to_save.save();

            if (!userStored) {
                return res.status(500).json({
                    "message": "No user saved"
                });
            }

            return res.status(200).json({
                ":_id": userStored._id
            });

        } catch {
            return res.status(500).json({
                "message": "Error while saving user"
            });
        }
    } catch {
        return res.status(500).json({
            "message": "Error while finding user duplicate"
        });
    }
}

const login = (req, res) => {
    let userBody = req.body;

    if (!userBody.username || !userBody.password) {
        return res.status(400).json({
            "message": "Faltan datos"
        });
    }

    User.findOne({ username: userBody.username }).then(user => {
        if (!user) {
            return res.status(400).json({
                "message": "Usuario no existe"
            });
        }

        let pwd = bcrypt.compareSync(userBody.password, user.password);

        if (!pwd) {
            return res.status(400).json({
                "message": "Contraseña incorrecta"
            });
        }

        const token = libjwt.createToken(user);

        return res.status(200).json({
            token
        });

    }).catch(() => {
        return res.status(500).json({
            "message": "Error while finding user"
        });
    });
}

const myObject = (req, res) => {
    User.findById(req.user.id).select({ password: 0 }).then(user => {
        if (!user) {
            return res.status(404).json({
                "message": "User doesn't exist"
            });
        }

        return res.status(200).json({
            user
        });
    }).catch(() => {
        return res.status(404).json({
            "message": "Error while finding user"
        });
    });
}

const updatePassword = async (req, res) => {
    let userBody = req.body;

    if (!userBody.id || !userBody.password) {
        return res.status(400).json({
            "message": "Faltan datos"
        });
    }

    let pwd = await bcrypt.hash(userBody.password, 10);

    User.findOneAndUpdate({ _id: userBody.id }, { password: pwd }, { new: true }).then(userUpdated => {
        if (!userUpdated) {
            return res.status(404).json({
                "mensaje": "User not found"
            });
        }
        return res.status(200).send({
            "message": "success"
        });
    }).catch(() => {
        return res.status(404).json({
            "mensaje": "Error while finding and updating user"
        });
    });
}

module.exports = {
    register,
    login,
    myObject,
    updatePassword
}
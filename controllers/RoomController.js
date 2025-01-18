const Room = require("../models/RoomModel");

const create = async (req, res) => {
    let roomBody = req.body;
    let userId = req.user.id;

    if (!roomBody.code) {
        return res.status(400).json({
            "message": "Faltan datos"
        });
    }

    let roomData = {
        code: roomBody.code,
        admin: userId
    }

    try {
        const roomAlreadyExist = await Room.find({ code: roomData.code });

        if (roomAlreadyExist.length >= 1) {
            return res.status(400).json({
                "message": "El código de sala ya existe"
            });
        }

        let room_to_save = new Room(roomData);

        try {
            const roomStored = await room_to_save.save();

            if (!roomStored) {
                return res.status(500).json({
                    "message": "No room saved"
                });
            }

            return res.status(200).json({
                "room": roomStored
            });

        } catch {
            return res.status(500).json({
                "message": "Error while saving room"
            });
        }
    } catch {
        return res.status(500).json({
            "message": "Error while finding room duplicate"
        });
    }
}

const getByCode = (req, res) => {
    let roomCode = req.query.code;

    Room.findOne({ code: roomCode }).then(room => {
        if (!room) {
            return res.status(404).json({
                "message": "No existe sala con ese código"
            });
        }

        return res.status(200).json({
            room
        });
    }).catch(() => {
        return res.status(404).json({
            "message": "Error while finding room"
        });
    });
}

const getById = (req, res) => {
    let roomId = req.query.id;

    Room.findById(roomId).then(room => {
        if (!room) {
            return res.status(404).json({
                "status": "error",
                "message": "No existe sala con ese código"
            });
        }

        return res.status(200).json({
            room
        });
    }).catch(() => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while finding room"
        });
    });
}

const getByIdAndIncPlayers = (req, res) => {
    let roomId = req.query.id;
    let userId = req.user.id;

    Room.findByIdAndUpdate({ _id: roomId }, { $addToSet: { players: userId } }, { new: true }).then(room => {
        if (!room) {
            return res.status(404).json({
                "message": "No existe sala con ese código"
            });
        }

        return res.status(200).json({
            room
        });
    }).catch(() => {
        return res.status(404).json({
            "message": "Error while finding room"
        });
    });
}

const getByIdAndDecPlayers = (req, res) => {
    let roomId = req.query.id;
    let userId = req.user.id;

    Room.findByIdAndUpdate({ _id: roomId }, { $pull: { players: userId } }, { new: true }).then(room => {
        if (!room) {
            return res.status(404).json({
                "message": "No existe sala con ese código"
            });
        }

        return res.status(200).json({
            room
        });
    }).catch(() => {
        return res.status(404).json({
            "message": "Error while finding room"
        });
    });
}

const update = (req, res) => {
    let roomBody = req.body.room;

    Room.findByIdAndUpdate({ _id: roomBody._id }, roomBody, { new: true }).then(roomUpdated => {
        if (!roomUpdated) {
            return res.status(404).json({
                "mensaje": "Room not found"
            });
        }
        return res.status(200).send({
            "room": roomUpdated
        });
    }).catch((e) => {
        return res.status(404).json({
            "mensaje": "Error while finding and updating room"
        });
    });
}

module.exports = {
    create,
    getByCode,
    getById,
    getByIdAndIncPlayers,
    getByIdAndDecPlayers,
    update
}
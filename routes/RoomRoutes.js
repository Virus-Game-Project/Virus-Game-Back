const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/RoomController");

const check = require("../authorization/auth");

router.post("/create", check.auth, RoomController.create);
router.get("/getByCode", check.auth, RoomController.getByCode);
router.get("/getById", RoomController.getById);
router.get("/getByIdAndIncPlayers", RoomController.getByIdAndIncPlayers);
router.get("/getByIdAndDecPlayers", RoomController.getByIdAndDecPlayers);
router.put("/update", RoomController.update);

module.exports = router;
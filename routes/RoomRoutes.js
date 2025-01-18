const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/RoomController");

const check = require("../authorization/auth");

router.post("/create", check.auth, RoomController.create);
router.get("/getByCode", RoomController.getByCode);
router.get("/getById", RoomController.getById);
router.get("/getByIdAndIncPlayers", check.auth, RoomController.getByIdAndIncPlayers);
router.get("/getByIdAndDecPlayers", check.auth, RoomController.getByIdAndDecPlayers);
router.put("/update", RoomController.update);

module.exports = router;
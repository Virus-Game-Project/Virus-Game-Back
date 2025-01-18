const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/RoomController");

router.post("/create", RoomController.create);
router.get("/getByCode", RoomController.getByCode);

module.exports = router;
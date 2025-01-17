const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

const check = require("../authorization/auth");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/myObject", check.auth, UserController.myObject);
router.put("/updatePassword", UserController.updatePassword);

module.exports = router;
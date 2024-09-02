const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController");
const { validateUser, validate } = require('../validation/validateUser');

const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;

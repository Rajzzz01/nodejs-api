const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const { validateUser, validate } = require('../validation/validateUser');

const userController = new UserController();

router.post("/create-user", validateUser, validate, userController.createUser);

router.get("/list-users", userController.getUsers);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-user/:id", userController.getUser);
router.put("/update-user/:id", userController.updateUser);
router.get("/profile", userController.getProfile);

module.exports = router;

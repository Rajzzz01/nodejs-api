const express = require("express");
const router = express.Router();
const users = require("./users");
const path = require("path");
const authentication = require("./authentication");
const authMiddleware = require("../middleware/auth");
const auth = new authMiddleware();

router.use("/users", auth.authenticate, users);
router.use("/auth", authentication);
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;

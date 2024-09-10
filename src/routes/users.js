const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserController = require("../controller/userController");
const { validateUser, validate } = require("../validation/validateUser");

const userController = new UserController();
// Set up storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Serve static files from the uploads directory
router.post("/create-user", validateUser, validate, userController.createUser);
router.get("/list-users", userController.getUsers);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-user/:id", userController.getUser);
router.put("/update-user/:id", userController.updateUser);
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.post(
  "/profile-pic",
  upload.single("image"),
  userController.updateProfilePic
);

module.exports = router;

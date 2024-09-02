const { check, validationResult } = require("express-validator");

// Define validation rules
const validateUser = [
  check("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
];

// Validation error handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateUser, validate };

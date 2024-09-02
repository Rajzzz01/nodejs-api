const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

class authController {
  async register(req, res) {
    try {
      console.log("Request body", req.body);

      // Destructure the name and email from the request body
      const { name, email, password } = req.body;

      // Check if the email already exists (optional but recommended for better error handling)
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create the user with Prisma
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });

      // Respond with the created user or a success message
      res.status(201).json({
        message: "User created successfully",
        user: user,
      });
    } catch (error) {
      if (error.code === "P2002") {
        // This error code corresponds to a unique constraint violation
        res.status(400).json({ error: "Email already exists" });
      } else {
        console.error("Error creating user:", error.message);
        res
          .status(500)
          .json({ error: "An error occurred while creating the user" });
      }
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!existingUser || !bcrypt.compare(password, existingUser.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: existingUser.id }, jwtSecret, {
        expiresIn: '1h',
      });

      res
        .status(200)
        .json({
          message: "Signin successful",
          user: { username: existingUser.username, email: existingUser.email, token: token},
        });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }
}

module.exports = authController;

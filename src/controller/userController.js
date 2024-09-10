const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

class UserController {
  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser) {
        res.status(404).json({ message: "User not found" });
      }

      // Respond with the list of users
      res.status(200).json({
        message: "User details",
        user: existingUser,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }

  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 3;

      // Fetch the users with pagination
      const users = await prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const totalUsers = await prisma.user.count();

      // Respond with the list of users
      res.status(200).json({
        message: "Users list",
        totalUsers: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
        users: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      console.log("deleteUser", userId);
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser) {
        res.status(404).json({ message: "User not found" });
      }
      await prisma.user.delete({
        where: { id: userId },
      });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the user" });
    }
  }

  async createUser(req, res) {
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

  async updateUser(req, res) {
    try {
      const userId = req.params.id;

      // Check if the user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: req.body.name,
          email: req.body.email,
        },
      });

      // Respond with the updated user details
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  }

  async getProfile(req, res) {
    try {
      const authorization = req.headers;

      if (!authorization) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
      console.log("decoded", decoded);
      const existingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!existingUser) {
        res.status(404).json({ message: "Unauthorized" });
      }

      res.status(200).json({
        message: "User details",
        user: existingUser,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }

  async updateProfile(req, res) {
    try {

      const { email, name, address } = req.body;
      const authorization = req.headers.authorization;

      if (!authorization) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
      const existingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!existingUser) {
        res.status(404).json({ message: "Unauthorized" });
      }

      const user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email,
          name,
          UserDetails: {
            upsert: {
              create: { address},
              update: { address},
            },
          },
        },
        include: {
          UserDetails: true,
        },
      });

      // Respond with the list of users
      res.status(200).json({
        message: "Profile updated successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }

  async updateProfilePic(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const url = `${baseUrl}/uploads/${file.filename}`;

      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
  
      const existingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update or create the user's profile picture URL
      const userDetails = await prisma.userDetails.update({
        where: { userId: existingUser.id },
        data: { url },
      });
  
      res.status(200).json({
        message: "Profile pic updated successfully",
        user: userDetails,
      });
    } catch (error) {
      console.error("Error updating profile pic:", error.message);
      res.status(500).json({ error: "An error occurred while updating the profile picture" });
    }
  }
  
}

module.exports = UserController;

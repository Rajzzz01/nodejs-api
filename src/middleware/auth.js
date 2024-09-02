const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

class auth {
  async authenticate(req, res, next) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        req.user = user;
        next();
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }
}

module.exports = auth;

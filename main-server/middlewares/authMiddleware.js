import jwt from 'jsonwebtoken';
import User from '../models/User.js';
// import sequelize from '../database.js';
// import { Sequelize } from 'sequelize';

const verifyLoggedIn = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      const user = await User.findOne({
        where: { id: decoded.id },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  return res.status(401).json({ message: "No token provided" });
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "SUPERADMIN" && req.user.role !== "ADMIN")) {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

export { verifyLoggedIn, verifyAdmin };

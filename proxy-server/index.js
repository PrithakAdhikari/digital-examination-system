import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import cors from "cors";

import User from "./models/User.js";

import authRouter from "./routes/authRoutes.js";
import sequelizeSqlite from "./sqliteDatabase.js";
import ProxySetting from "./models/ProxySetting.js";

import http from "http";

const PORT = process.env.PORT || 8000;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

const strategy = new JWTStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findByPk(jwt_payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
});

passport.use(strategy);

const app = express();

app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Express is up." });
});

app.use("/auth", authRouter);

// Protected route example
app.get(
  "/auth/profile",
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "An error occurred during authentication." });
      }
      if (!user) {
        return res
          .status(401)
          .json({ error: "Unauthorized. Token is missing or invalid." });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.json({ message: "This is a protected route.", user: req.user });
  }
);

// Database connection and server startup
const runApp = async () => {
  try {
    await sequelizeSqlite.authenticate();
    console.log("SQLite database connected successfully.");
    await sequelizeSqlite.sync({ alter: true });
    console.log("SQLite database synced.");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
};

runApp();

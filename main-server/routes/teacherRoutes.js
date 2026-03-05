import express from "express";
import {
    getAllQuestionsToSet,
    createQuestion
} from "../controllers/teacherController.js";
import { verifyLoggedIn, verifyTeacher } from "../middlewares/authMiddleware.js";

const teacherRouter = express.Router();

// Get all subjects assigned to a teacher to set questions for
teacherRouter.get("/all-questions-to-set", verifyLoggedIn, verifyTeacher, getAllQuestionsToSet);

// Create paper and questions for an assigned subject
teacherRouter.post("/create-question", verifyLoggedIn, verifyTeacher, createQuestion);

export default teacherRouter;

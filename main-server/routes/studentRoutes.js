import express from "express";
import {
    getAllExaminations,
    getExaminationById
} from "../controllers/studentController.js";
import { verifyLoggedIn } from "../middlewares/authMiddleware.js";

const studentRouter = express.Router();

studentRouter.get("/examinations", verifyLoggedIn, getAllExaminations);
studentRouter.get("/examination/:id", verifyLoggedIn, getExaminationById);

export default studentRouter;

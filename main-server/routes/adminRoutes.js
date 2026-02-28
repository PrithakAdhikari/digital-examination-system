import express from "express";
import {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  patchCenter,
  deleteCenter,
} from "../controllers/examinationCenterController.js";
import {
  createComprehensiveExamination,
  getAllExaminations,
  getExaminationById
} from "../controllers/examinationController.js";
import {
  createSubjectPaper,
  getAllSubjectPapers,
  getSubjectPaperById,
} from "../controllers/subjectPaperController.js";
import { verifyLoggedIn, verifyAdmin } from "../middlewares/authMiddleware.js";

const adminRouter = express.Router();

// CRUD Examination Center routes
adminRouter.post("/center", verifyLoggedIn, verifyAdmin, createCenter);
adminRouter.get("/center", verifyLoggedIn, verifyAdmin, getAllCenters);
adminRouter.get("/center/:id", verifyLoggedIn, verifyAdmin, getCenterById);
adminRouter.put("/center/:id", verifyLoggedIn, verifyAdmin, updateCenter);
adminRouter.patch("/center/:id", verifyLoggedIn, verifyAdmin, patchCenter);
adminRouter.delete("/center/:id", verifyLoggedIn, verifyAdmin, deleteCenter);

// Comprehensive Examination creation and Fetching
adminRouter.post("/examination", verifyLoggedIn, verifyAdmin, createComprehensiveExamination);
adminRouter.get("/examination", verifyLoggedIn, verifyAdmin, getAllExaminations);
adminRouter.get("/examination/:id", verifyLoggedIn, verifyAdmin, getExaminationById);

// CRUD Subject Paper routes
adminRouter.post("/subject-paper", verifyLoggedIn, verifyAdmin, createSubjectPaper);
adminRouter.get("/subject-paper", verifyLoggedIn, verifyAdmin, getAllSubjectPapers);
adminRouter.get("/subject-paper/:id", verifyLoggedIn, verifyAdmin, getSubjectPaperById);

export default adminRouter;

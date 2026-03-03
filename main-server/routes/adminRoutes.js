import express from "express";
import {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  patchCenter,
  deleteCenter,
  createComprehensiveExamination,
  getAllExaminations,
  getExaminationById,
  createSubjectPaper,
  getAllSubjectPapers,
  getSubjectPaperById,
  createUser,
  bulkCreateUsers,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser
} from "../controllers/adminController.js";
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

// CRUD User routes
adminRouter.post("/users", verifyLoggedIn, verifyAdmin, createUser);
adminRouter.post("/users/bulk", verifyLoggedIn, verifyAdmin, bulkCreateUsers);
adminRouter.get("/users", verifyLoggedIn, verifyAdmin, getAllUsers);
adminRouter.get("/users/:id", verifyLoggedIn, verifyAdmin, getUserById);
adminRouter.put("/users/:id", verifyLoggedIn, verifyAdmin, updateUser);
adminRouter.delete("/users/:id", verifyLoggedIn, verifyAdmin, deleteUser);

// Status Management (Soft Delete)
adminRouter.patch("/users/:id/deactivate", verifyLoggedIn, verifyAdmin, deactivateUser);
adminRouter.patch("/users/:id/activate", verifyLoggedIn, verifyAdmin, activateUser);

export default adminRouter;

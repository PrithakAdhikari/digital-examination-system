import express from "express";
import {
    getAllQuestionsToSet,
    createQuestion,
    getAllAssignedPapersToCheck,
    getAllStudentsAnswersToCheck,
    getAnswerById,
    assignSubjectMarks,
    getStudentById,
    getAllStudentInTeacherCenter
} from "../controllers/teacherController.js";
import { verifyLoggedIn, verifyTeacher } from "../middlewares/authMiddleware.js";

const teacherRouter = express.Router();

// Get all subjects assigned to a teacher to set questions for
teacherRouter.get("/all-questions-to-set", verifyLoggedIn, verifyTeacher, getAllQuestionsToSet);

// Create paper and questions for an assigned subject
teacherRouter.post("/create-question", verifyLoggedIn, verifyTeacher, createQuestion);

// 1. Fetch list of subject papers that are assigned to currently logged in user
teacherRouter.get("/assigned-papers-to-check", verifyLoggedIn, verifyTeacher, getAllAssignedPapersToCheck);

// 2. Fetch list of all student answers for a subject
teacherRouter.get("/student-answers-to-check/:subject_fk_id", verifyLoggedIn, verifyTeacher, getAllStudentsAnswersToCheck);

// 3. Fetch specific answer and decrypt
teacherRouter.get("/answer/:answer_id", verifyLoggedIn, verifyTeacher, getAnswerById);

// 4. Assign marks for a subject
teacherRouter.post("/assign-subject-marks", verifyLoggedIn, verifyTeacher, assignSubjectMarks);

// 5. Get student details and results
teacherRouter.get("/student/:student_id", verifyLoggedIn, verifyTeacher, getStudentById);

// 6. Get all students in a teacher's center
teacherRouter.get("/center-students", verifyLoggedIn, verifyTeacher, getAllStudentInTeacherCenter);

export default teacherRouter;

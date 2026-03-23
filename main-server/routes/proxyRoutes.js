import express from "express";
import { registerExamCenter } from "../controllers/proxyAuthController.js";
import { verifyHmacSignature } from "../middlewares/hmacMiddleware.js";
import { getExaminationsForProxy, getQuestionsForProxy, bulkCreateStudentAnswers, getStudentsInCenter } from "../controllers/proxyController.js";

const router = express.Router();

/**
 * Public route for initial registration of an examination center.
 */
router.post("/register-exam-center", registerExamCenter);

/**
 * Protected routes requiring HMAC signature verification.
 */
router.get("/test", verifyHmacSignature, (req, res) => {
    res.json({ message: "HMAC Authentication Successful!", center: req.examinationCenter.center_name_txt });
});

router.get("/examinations", verifyHmacSignature, getExaminationsForProxy);
router.get("/students", verifyHmacSignature, getStudentsInCenter);
router.get("/get-questions/:subjectId", verifyHmacSignature, getQuestionsForProxy);
router.post("/bulk-create-answers", verifyHmacSignature, bulkCreateStudentAnswers);

export default router;

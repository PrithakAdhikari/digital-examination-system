import crypto from "crypto";
import Examination from "../models/Examination.js";
import ExaminationSubject from "../models/ExaminationSubject.js";
import SubjectPaper from "../models/SubjectPaper.js";
import PaperQuestion from "../models/PaperQuestion.js";
import ExamAnswerToken from "../models/ExamAnswerToken.js";
import StudentQuestionAnswer from "../models/StudentQuestionAnswer.js";
import sequelize from "../database.js";
import { Sequelize } from "sequelize";

// Helper function for AES-256 decryption (consistent with adminController.js)
const decrypt = (encryptedText, key) => {
    if (!encryptedText) return null;
    try {
        const [ivHex, encrypted] = encryptedText.split(":");
        if (!ivHex || !encrypted) return encryptedText;
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (err) {
        console.error("Decryption failed:", err.message);
        return encryptedText;
    }
};

export const getExaminationsForProxy = async (req, res) => {
    try {
        const centerId = req.examinationCenter.id;

        console.log(centerId);

        const examinations = await sequelize.query(
            `
            SELECT e.*
            FROM public.examinations e
            WHERE :centerId::text IN (
                SELECT jsonb_array_elements_text(e.center_fk_list)
            )
            ORDER BY e."createdAt_ts" DESC
            `,
            {
                replacements: { centerId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Examinations fetched successfully",
            data: examinations,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching examinations: " + err.message });
    }
};

export const getQuestionsForProxy = async (req, res) => {
    const { examId } = req.params;
    try {
        // 1. Fetch the examination to check start time
        const exam = await Examination.findByPk(examId);
        if (!exam) {
            return res.status(404).json({ error: "Examination not found" });
        }

        const startTime = new Date(exam.exam_startTime_ts);
        const now = new Date();

        const isTimeExceeded = now >= startTime;

        // 2. Fetch all questions for this examination
        const results = await sequelize.query(
            `
            SELECT pq.*, 
                   eat.aes_256_key as encrypted_key
            FROM public."PaperQuestion" pq
            JOIN public."SubjectPaper" sp ON pq.paper_fk_id = sp.id
            JOIN public."ExaminationSubject" es ON sp.subject_fk_id = es.id
            LEFT JOIN public."ExamAnswerToken" eat ON pq.id = eat.question_fk_id
            WHERE es.exam_fk_id = :examId
            `,
            {
                replacements: { examId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!isTimeExceeded) {
            return res.status(403).json({
                error: "Forbidden: Examination has not started yet. Questions cannot be accessed before the start time.",
                startTime: exam.exam_startTime_ts
            });
        }

        // 3. Decrypt questions
        const masterKeyHex = process.env.AES_MASTER_KEY;
        if (!masterKeyHex) {
            throw new Error("AES_MASTER_KEY not found in .env");
        }
        const masterKey = Buffer.from(masterKeyHex, "hex");

        const decryptedQuestions = results.map((q) => {
            if (!q.encrypted_key) return q;

            // 1. Decrypt the paper key using master key
            const paperKeyHex = decrypt(q.encrypted_key, masterKey);
            const paperKey = Buffer.from(paperKeyHex, "hex");

            // 2. Decrypt question data using the paper key
            const baseQuestion = {
                id: q.id,
                paper_fk_id: q.paper_fk_id,
                question_type: q.question_type,
                question_txt: decrypt(q.question_txt, paperKey),
            };

            if (q.question_type === "MCQ") {
                return {
                    ...baseQuestion,
                    option1: decrypt(q.option1, paperKey),
                    option2: decrypt(q.option2, paperKey),
                    option3: decrypt(q.option3, paperKey),
                    option4: decrypt(q.option4, paperKey),
                };
            }

            return baseQuestion;
        });

        res.status(200).json({
            message: "Questions fetched and decrypted successfully",
            decrypted: true,
            data: decryptedQuestions,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching questions: " + err.message });
    }
};

/**
 * bulkCreateStudentAnswers
 * Accepts an array of student answers from the proxy and bulk creates/updates them.
 */
export const bulkCreateStudentAnswers = async (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "answers array is required." });
    }

    const t = await sequelize.transaction();

    try {
        await StudentQuestionAnswer.bulkCreate(answers, {
            updateOnDuplicate: ["stud_answer", "updatedAt_ts"],
            transaction: t,
        });

        await t.commit();

        res.status(200).json({
            message: `Successfully synced ${answers.length} answers.`,
        });
    } catch (err) {
        await t.rollback();
        console.error("Bulk sync error:", err.message);
        res.status(500).json({ error: "Error during bulk sync: " + err.message });
    }
};

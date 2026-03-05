import Joi from "joi";
import crypto from "crypto";
import SubjectPaper from "../models/SubjectPaper.js";
import PaperQuestion from "../models/PaperQuestion.js";
import ExamAnswerToken from "../models/ExamAnswerToken.js";
import ExaminationSubject from "../models/ExaminationSubject.js";
import sequelize from "../database.js";
import { Sequelize } from "sequelize";

// --- Helper Functions ---

// Helper function for AES-256 encryption
const encrypt = (text, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};

// Helper function for AES-256 decryption
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
        return encryptedText; // Return original if decryption fails
    }
};

// --- Validation Schemas ---

const subjectPaperSchema = Joi.object({
    subject_fk_id: Joi.number().required(),
    exam_batch_year: Joi.string().max(100).required(),
    paper_checkers_list: Joi.array().items(Joi.number()).allow(null),
    questions: Joi.array()
        .items(
            Joi.object({
                question_txt: Joi.string().required(),
                question_type: Joi.string().valid("LONG", "SHORT", "MCQ").required(),
                option1: Joi.string().allow(null, "").optional(),
                option2: Joi.string().allow(null, "").optional(),
                option3: Joi.string().allow(null, "").optional(),
                option4: Joi.string().allow(null, "").optional(),
            })
        )
        .min(1)
        .required(),
});

// --- Teacher Controllers ---

/**
 * GET getAllQuestionsToSet
 * This API is used by a Teacher to see the list of subjects (and corresponding exams) 
 * they are assigned to set questions for.
 */
export const getAllQuestionsToSet = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const subjects = await sequelize.query(
            `
            SELECT 
                es.id AS "subject_id",
                es.subject_name_txt,
                es.full_marks,
                es.pass_marks,
                e.id AS "exam_id",
                e.exam_name_txt,
                e."exam_startTime_ts"
            FROM public."ExaminationSubject" es
            JOIN public.examinations e ON es.exam_fk_id = e.id
            WHERE es.exam_setter_user_fk_id = :userId
            ORDER BY e."exam_startTime_ts" ASC;
            `,
            {
                replacements: { userId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Assigned subjects fetched successfully",
            data: subjects,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching questions to set: " + err.message });
    }
};

/**
 * POST createQuestion
 * (Formerly createSubjectPaper in adminController)
 * Creates a subject paper and its encrypted questions.
 */
export const createQuestion = async (req, res) => {
    const { error, value } = subjectPaperSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    // Verify that the user is the assigned setter for this subject
    try {
        const [subject] = await sequelize.query(
            `SELECT exam_setter_user_fk_id FROM public."ExaminationSubject" WHERE id = :id`,
            {
                replacements: { id: value.subject_fk_id },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!subject) {
            return res.status(404).json({ error: "Examination subject not found." });
        }

        if (parseInt(subject.exam_setter_user_fk_id) !== parseInt(req.user.id)) {
            return res.status(403).json({ error: "Forbidden: You are not the assigned setter for this subject." });
        }
    } catch (err) {
        return res.status(500).json({ error: "Error verifying subject setter: " + err.message });
    }

    const t = await sequelize.transaction();

    try {
        // 1. Generate a random AES-256 key for this paper
        const paperKey = crypto.randomBytes(32);

        // 2. Encrypt the paper key using the Master Key from .env
        const masterKeyHex = process.env.AES_MASTER_KEY;
        if (!masterKeyHex) {
            throw new Error("AES_MASTER_KEY not found in .env");
        }
        const encryptedPaperKey = encrypt(
            paperKey.toString("hex"),
            Buffer.from(masterKeyHex, "hex")
        );

        // 3. Create the SubjectPaper
        const paper = await SubjectPaper.create(
            {
                subject_fk_id: value.subject_fk_id,
                exam_batch_year: value.exam_batch_year,
                paper_checkers_list: value.paper_checkers_list,
            },
            { transaction: t }
        );

        // 4. Encrypt and create questions
        for (const q of value.questions) {
            const encryptedData = {
                paper_fk_id: paper.id,
                question_type: q.question_type,
                question_txt: encrypt(q.question_txt, paperKey),
                option1: q.option1 ? encrypt(q.option1, paperKey) : null,
                option2: q.option2 ? encrypt(q.option2, paperKey) : null,
                option3: q.option3 ? encrypt(q.option3, paperKey) : null,
                option4: q.option4 ? encrypt(q.option4, paperKey) : null,
            };

            const question = await PaperQuestion.create(encryptedData, { transaction: t });

            // 5. Store the encrypted paper key for this question
            await ExamAnswerToken.create(
                {
                    question_fk_id: question.id,
                    aes_256_key: encryptedPaperKey,
                },
                { transaction: t }
            );
        }

        await t.commit();

        res.status(201).json({
            message: "Subject paper and questions created successfully with encryption.",
            data: {
                paperId: paper.id,
                questionsCount: value.questions.length,
            },
        });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: "Error creating subject paper: " + err.message });
    }
};

import Joi from "joi";
import crypto from "crypto";
import SubjectPaper from "../models/SubjectPaper.js";
import PaperQuestion from "../models/PaperQuestion.js";
import ExamAnswerToken from "../models/ExamAnswerToken.js";
import ExaminationSubject from "../models/ExaminationSubject.js";
import StudentQuestionAnswer from "../models/StudentQuestionAnswer.js";
import StudentAnswerMarks from "../models/StudentAnswerMarks.js";
import User from "../models/User.js";
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

/**
 * 1. getAllAssignedPapersToCheck
 * Fetch list of subject papers that are assigned to currently logged in user.
 */
export const getAllAssignedPapersToCheck = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch papers where user is in paper_checkers_list (JSONB array)
        const papers = await sequelize.query(
            `
            SELECT 
                sp.id AS "paper_id",
                sp.subject_fk_id,
                sp.exam_batch_year,
                es.subject_name_txt,
                e.exam_name_txt
            FROM public."SubjectPaper" sp
            JOIN public."ExaminationSubject" es ON sp.subject_fk_id = es.id
            JOIN public.examinations e ON es.exam_fk_id = e.id
            WHERE sp.paper_checkers_list @> :userId::jsonb
            ORDER BY sp."createdAt_ts" DESC;
            `,
            {
                replacements: { userId: JSON.stringify([parseInt(userId)]) },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Assigned papers fetched successfully",
            data: papers,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching assigned papers: " + err.message });
    }
};

/**
 * 2. getAllStudentsAnswersToCheck
 * Use subject_fk_id to fetch the list of all the assigned student answers to be checked by currently logged in user.
 */
export const getAllStudentsAnswersToCheck = async (req, res) => {
    try {
        const { subject_fk_id } = req.params;
        const userId = req.user.id;

        // Verify user is an assigned checker for this subject
        const [assigned] = await sequelize.query(
            `SELECT id FROM public."SubjectPaper" WHERE subject_fk_id = :subject_fk_id AND paper_checkers_list @> :userId::jsonb`,
            {
                replacements: {
                    subject_fk_id,
                    userId: JSON.stringify([parseInt(userId)])
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!assigned) {
            return res.status(403).json({ error: "Forbidden: You are not an assigned checker for this subject." });
        }

        // Fetch student answers for this subject
        const answers = await sequelize.query(
            `
            SELECT 
                sqa.id AS "answer_id",
                sqa.stud_user_fk_id,
                sqa."createdAt_ts" AS "submitted_at",
                u.firstname_txt,
                u.lastname_txt,
                u.username,
                pq.question_type,
                pq.id AS "question_id"
            FROM public."StudentQuestionAnswer" sqa
            JOIN public."User" u ON sqa.stud_user_fk_id = u.id
            JOIN public."PaperQuestion" pq ON sqa.exam_question_fk_id = pq.id
            JOIN public."SubjectPaper" sp ON pq.paper_fk_id = sp.id
            WHERE sp.subject_fk_id = :subject_fk_id
            ORDER BY sqa."createdAt_ts" DESC;
            `,
            {
                replacements: { subject_fk_id },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Student answers fetched successfully",
            data: answers,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching student answers: " + err.message });
    }
};

/**
 * 3. getAnswerById
 * Use answer_id to fetch the specific answer and decrypt the answer before displaying them.
 */
export const getAnswerById = async (req, res) => {
    try {
        const { answer_id } = req.params;
        const userId = req.user.id;

        // Fetch answer and its associated paper key info
        const [result] = await sequelize.query(
            `
            SELECT 
                sqa.id AS "answer_id",
                sqa.stud_answer,
                eat.aes_256_key AS "encrypted_paper_key",
                pq.id AS "question_id",
                sp.subject_fk_id
            FROM public."StudentQuestionAnswer" sqa
            JOIN public."PaperQuestion" pq ON sqa.exam_question_fk_id = pq.id
            JOIN public."SubjectPaper" sp ON pq.paper_fk_id = sp.id
            LEFT JOIN public."ExamAnswerToken" eat ON pq.id = eat.question_fk_id
            WHERE sqa.id = :answer_id;
            `,
            {
                replacements: { answer_id },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!result) {
            return res.status(404).json({ error: "Answer not found." });
        }

        // Verify checker assignment
        const [assigned] = await sequelize.query(
            `SELECT id FROM public."SubjectPaper" WHERE subject_fk_id = :subject_fk_id AND paper_checkers_list @> :userId::jsonb`,
            {
                replacements: {
                    subject_fk_id: result.subject_fk_id,
                    userId: JSON.stringify([parseInt(userId)])
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!assigned) {
            return res.status(403).json({ error: "Forbidden: You are not an assigned checker for this subject." });
        }

        if (!result.encrypted_paper_key) {
            return res.status(200).json({
                message: "Answer fetched (no encryption found)",
                data: {
                    answer_id: result.answer_id,
                    stud_answer: result.stud_answer
                }
            });
        }

        // Decrypt the paper key using master key
        const masterKeyHex = process.env.AES_MASTER_KEY;
        const paperKeyHex = decrypt(result.encrypted_paper_key, Buffer.from(masterKeyHex, "hex"));
        const paperKey = Buffer.from(paperKeyHex, "hex");

        // Decrypt the student answer
        // Note: stud_answer is expected to be an object or string depending on question type
        // If it's stored encrypted, we decrypt it.
        let decryptedAnswer = result.stud_answer;
        if (typeof result.stud_answer === "string") {
            decryptedAnswer = decrypt(result.stud_answer, paperKey);
        } else if (result.stud_answer && typeof result.stud_answer === "object") {
            // For MCQ or structured answers, we might need to decrypt individual fields
            // Assuming for now it's a string or the whole object is serialized string
            // Let's handle common cases
            if (result.stud_answer.text) {
                decryptedAnswer.text = decrypt(result.stud_answer.text, paperKey);
            }
        }

        res.status(200).json({
            message: "Answer fetched and decrypted successfully",
            data: {
                answer_id: result.answer_id,
                stud_answer: decryptedAnswer
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching answer: " + err.message });
    }
};

/**
 * 4. POST assignSubjectMarks
 * Use student_user_fk_id and (logic to link to student answers) and marks_obtained 
 * to create a StudentAnswerMarks record.
 * User feedback: "its StudentAnswerMarks use that"
 */
export const assignSubjectMarks = async (req, res) => {
    const assignMarksSchema = Joi.object({
        student_user_fk_id: Joi.number().required(),
        exam_subject_fk_id: Joi.number().required(),
        marks_obtained: Joi.number().required(),
        feedback: Joi.string().allow(null, "").optional(),
    });

    const { error, value } = assignMarksSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const userId = req.user.id;

        // Verify checker assignment
        const [assigned] = await sequelize.query(
            `SELECT id FROM public."SubjectPaper" WHERE subject_fk_id = :subject_fk_id AND paper_checkers_list @> :userId::jsonb`,
            {
                replacements: {
                    subject_fk_id: value.exam_subject_fk_id,
                    userId: JSON.stringify([parseInt(userId)])
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!assigned) {
            return res.status(403).json({ error: "Forbidden: You are not an assigned checker for this subject." });
        }

        // Find one answer for this student and subject to link the marks to
        // If multiple answers exist, we link to the first one or logic might need refinement
        // Typically subject marks might be stored differently, but user said use StudentAnswerMarks.
        const [answer] = await sequelize.query(
            `
            SELECT sqa.id 
            FROM public."StudentQuestionAnswer" sqa
            JOIN public."PaperQuestion" pq ON sqa.exam_question_fk_id = pq.id
            JOIN public."SubjectPaper" sp ON pq.paper_fk_id = sp.id
            WHERE sqa.stud_user_fk_id = :student_user_fk_id AND sp.subject_fk_id = :exam_subject_fk_id
            LIMIT 1;
            `,
            {
                replacements: {
                    student_user_fk_id: value.student_user_fk_id,
                    exam_subject_fk_id: value.exam_subject_fk_id
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!answer) {
            return res.status(404).json({ error: "No answers found for this student in this subject." });
        }

        // Create or update marks
        const [marks, created] = await StudentAnswerMarks.findOrCreate({
            where: {
                stud_user_fk_id: value.student_user_fk_id,
                stud_answer_fk_id: answer.id
            },
            defaults: {
                marks_obtained: value.marks_obtained,
                feedback: value.feedback
            }
        });

        if (!created) {
            marks.marks_obtained = value.marks_obtained;
            marks.feedback = value.feedback;
            await marks.save();
        }

        res.status(200).json({
            message: created ? "Marks assigned successfully" : "Marks updated successfully",
            data: marks,
        });
    } catch (err) {
        res.status(500).json({ error: "Error assigning marks: " + err.message });
    }
};

/**
 * 5. GET getStudentById
 * Fetch a comprehensive detailed response of the Student including every result.
 */
export const getStudentById = async (req, res) => {
    try {
        const { student_id } = req.params;

        // 1. Fetch student basic info
        const [student] = await sequelize.query(
            `SELECT 
                id, 
                (firstname_txt || ' ' || lastname_txt) AS full_name, 
                username, 
                email_txt, 
                phone_num_txt, 
                stud_batch_year, 
                stud_exam_symbol_no, 
                stud_exam_reg_no 
            FROM public."User" 
            WHERE id = :student_id`,
            {
                replacements: { student_id },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }

        // 2. Fetch all results for the student
        const results = await sequelize.query(
            `
            SELECT 
                sam.id AS result_id,
                sam.marks_obtained,
                sam.feedback,
                es.subject_name_txt,
                es.full_marks,
                es.pass_marks,
                e.exam_name_txt,
                e."exam_startTime_ts",
                sp.exam_batch_year
            FROM public."StudentAnswerMarks" sam
            JOIN public."StudentQuestionAnswer" sqa ON sam.stud_answer_fk_id = sqa.id
            JOIN public."PaperQuestion" pq ON sqa.exam_question_fk_id = pq.id
            JOIN public."SubjectPaper" sp ON pq.paper_fk_id = sp.id
            JOIN public."ExaminationSubject" es ON sp.subject_fk_id = es.id
            JOIN public.examinations e ON es.exam_fk_id = e.id
            WHERE sam.stud_user_fk_id = :student_id
            ORDER BY e."exam_startTime_ts" DESC;
            `,
            {
                replacements: { student_id },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Student details and results fetched successfully",
            data: {
                student: student || null,
                results: results || []
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching student details: " + err.message });
    }
};

/**
 * 6. GET getAllStudentInTeacherCenter
 * Fetch a list of every student in the logged in teacher's center.
 */
export const getAllStudentInTeacherCenter = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await sequelize.query(
            `
            SELECT 
                u.id, 
                (u.firstname_txt || ' ' || u.lastname_txt) AS "full_name", 
                u.username, 
                u.email_txt, 
                u.phone_num_txt, 
                u.role,
                u.stud_batch_year, 
                u.stud_exam_symbol_no, 
                ec.center_name_txt
            FROM public."User" u
            JOIN public."ExaminationCenter" ec ON u.center_fk_id = ec.id
            WHERE u.center_fk_id = (SELECT center_fk_id FROM public."User" WHERE id = :userId)
              AND u.role = 'STUDENT'
            ORDER BY u.firstname_txt ASC;
            `,
            {
                replacements: { userId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "No students found for this center." });
        }

        const responseData = {
            center_name: users[0].center_name_txt,
            students: users
        };

        res.status(200).json({
            message: "Center students fetched successfully",
            data: responseData,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching center students: " + err.message });
    }
};

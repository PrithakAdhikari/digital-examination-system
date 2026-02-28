import Joi from "joi";
import crypto from "crypto";
import SubjectPaper from "../models/SubjectPaper.js";
import PaperQuestion from "../models/PaperQuestion.js";
import ExamAnswerToken from "../models/ExamAnswerToken.js";
import sequelize from "../database.js";
import { Sequelize } from "sequelize";

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

// Validation schema for SubjectPaper
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

export const createSubjectPaper = async (req, res) => {
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

    console.log("The Subject: ", subject.exam_setter_user_fk_id);
    console.log("The User: ", req.user.id);

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
    console.log("The PaperKey: ", paperKey);

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

export const getAllSubjectPapers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const papers = await sequelize.query(
      `SELECT * FROM public."SubjectPaper" ORDER BY "createdAt_ts" DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: { limit, offset },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const [totalResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM public."SubjectPaper"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const total = parseInt(totalResult.count);

    res.status(200).json({
      message: "Subject papers fetched successfully",
      data: papers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching subject papers: " + err.message });
  }
};

export const getSubjectPaperById = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await sequelize.query(
      `
      SELECT sp.*,
             e."exam_startTime_ts",
             json_build_object(
               'id', es.id,
               'subject_name_txt', es.subject_name_txt,
               'full_marks', es.full_marks,
               'pass_marks', es.pass_marks
             ) AS subject,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', pq.id,
                   'question_type', pq.question_type,
                   'question_txt', pq.question_txt,
                   'option1', CASE WHEN pq.question_type = 'MCQ' THEN pq.option1 ELSE NULL END,
                   'option2', CASE WHEN pq.question_type = 'MCQ' THEN pq.option2 ELSE NULL END,
                   'option3', CASE WHEN pq.question_type = 'MCQ' THEN pq.option3 ELSE NULL END,
                   'option4', CASE WHEN pq.question_type = 'MCQ' THEN pq.option4 ELSE NULL END,
                   'encrypted_key', eat.aes_256_key
                 )
               )
               FROM public."PaperQuestion" pq
               LEFT JOIN public."ExamAnswerToken" eat ON pq.id = eat.question_fk_id
               WHERE pq.paper_fk_id = sp.id),
               '[]'
             ) AS questions
      FROM public."SubjectPaper" sp
      JOIN public."ExaminationSubject" es ON sp.subject_fk_id = es.id
      JOIN public.examinations e ON es.exam_fk_id = e.id
      WHERE sp.id = :id;
      `,
      {
        replacements: { id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!result) {
      return res.status(404).json({ error: "Subject paper not found" });
    }

    // Validation: Check if the examination has started
    const startTime = new Date(result.exam_startTime_ts);
    const now = new Date();

    if (now < startTime) {
      return res.status(403).json({
        error: "Forbidden: Examination has not started yet. Questions cannot be accessed before the start time.",
        startTime: result.exam_startTime_ts
      });
    }

    const masterKeyHex = process.env.AES_MASTER_KEY;
    if (!masterKeyHex) {
      throw new Error("AES_MASTER_KEY not found in .env");
    }
    const masterKey = Buffer.from(masterKeyHex, "hex");

    // Decrypt questions
    const decryptedQuestions = result.questions.map((q) => {
      // 1. Decrypt the paper key using master key
      const paperKeyHex = decrypt(q.encrypted_key, masterKey);
      const paperKey = Buffer.from(paperKeyHex, "hex");

      // 2. Decrypt question data using the paper key
      const baseQuestion = {
        id: q.id,
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

    const { questions, subject, exam_startTime_ts, subject_fk_id, ...paperData } = result;

    res.status(200).json({
      message: "Subject paper fetched successfully and decrypted.",
      data: {
        paper: {
          ...paperData,
          subject,
        },
        questions: decryptedQuestions,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching subject paper: " + err.message });
  }
};

export const deleteSubjectPaper = async (req, res) => {
  const { id } = req.params;
  try {
    const paper = await SubjectPaper.findByPk(id);
    if (!paper) {
      return res.status(404).json({ error: "Subject paper not found" });
    }

    await paper.destroy();
    res.status(200).json({
      message: "Subject paper deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Error deleting subject paper: " + err.message });
  }
};

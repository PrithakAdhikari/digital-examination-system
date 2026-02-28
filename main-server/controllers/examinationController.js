import Joi from "joi";
import Examination from "../models/Examination.js";
import ExaminationSubject from "../models/ExaminationSubject.js";
import sequelize from "../database.js";
import { Sequelize } from "sequelize";

// Validation schema for Comprehensive Examination creation
const comprehensiveExamSchema = Joi.object({
  exam_name_txt: Joi.string().max(255).required(),
  exam_startTime_ts: Joi.date().required(),
  result_time_ts: Joi.date().allow(null),
  center_fk_list: Joi.array().items(Joi.number()).allow(null),
  subjects: Joi.array().items(
    Joi.object({
      subject_name_txt: Joi.string().max(255).required(),
      exam_setter_user_fk_id: Joi.number().required(),
      full_marks: Joi.number().integer().required(),
      pass_marks: Joi.number().integer().required(),
    })
  ).min(1).required(),
});

export const createComprehensiveExamination = async (req, res) => {
  const { error, value } = comprehensiveExamSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // 0. Validate that all centers exist (using a raw SQL query)
  if (value.center_fk_list && value.center_fk_list.length > 0) {
    try {
      const [countResult] = await sequelize.query(
        `SELECT COUNT(*) as count FROM public."ExaminationCenter" WHERE id IN (:ids)`,
        {
          replacements: { ids: value.center_fk_list },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (parseInt(countResult.count) !== value.center_fk_list.length) {
        return res
          .status(400)
          .json({ error: "One or more examination centers do not exist." });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error validating centers: " + err.message });
    }
  }

  // 1. Validate that all exam setters exist and have allowed roles
  const examSetterIds = [...new Set(value.subjects.map((s) => s.exam_setter_user_fk_id))];
  try {
    const validSetters = await sequelize.query(
      `SELECT id FROM public."User" WHERE id IN (:ids) AND role != 'STUDENT'`,
      {
        replacements: { ids: examSetterIds },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (validSetters.length !== examSetterIds.length) {
      return res
        .status(400)
        .json({ error: "One or more exam setter users do not exist or are students." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error validating exam setters: " + err.message });
  }

  const t = await sequelize.transaction();
  try {
    // 2. Create the Examination
    const examination = await Examination.create({
      exam_name_txt: value.exam_name_txt,
      creator_user_fk_id: req.user.id,
      exam_startTime_ts: value.exam_startTime_ts,
      result_time_ts: value.result_time_ts,
      center_fk_list: value.center_fk_list,
    }, { transaction: t });

    // 3. Create the Examination Subjects
    const subjectsToCreate = value.subjects.map(s => ({
      ...s,
      exam_fk_id: examination.id
    }));

    await ExaminationSubject.bulkCreate(subjectsToCreate, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Examination and subjects created successfully",
      data: {
        examination,
        subjectsCount: subjectsToCreate.length
      }
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Error creating comprehensive examination: " + err.message });
  }
};

export const getExaminationById = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await sequelize.query(
      `
      SELECT e.*, 
             u.username AS creator_username,
             u.firstname_txt AS creator_firstname,
             u.lastname_txt AS creator_lastname,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', s.id,
                   'subject_name_txt', s.subject_name_txt,
                   'full_marks', s.full_marks,
                   'pass_marks', s.pass_marks,
                   'exam_setter_user_fk_id', s.exam_setter_user_fk_id,
                   'setter_username', us.username,
                   'setter_firstname', us.firstname_txt,
                   'setter_lastname', us.lastname_txt
                 )
               )
               FROM public."ExaminationSubject" s
               LEFT JOIN public."User" us ON s.exam_setter_user_fk_id = us.id
               WHERE s.exam_fk_id = e.id),
               '[]'
             ) AS subjects,
             COALESCE(
               (SELECT json_agg(c.*)
                FROM public."ExaminationCenter" c
                WHERE c.id::text IN (
                  SELECT jsonb_array_elements_text(e.center_fk_list)
                )
               ),
               '[]'
             ) AS centers
      FROM public.examinations e
      LEFT JOIN public."User" u ON e.creator_user_fk_id = u.id
      WHERE e.id = :id;
      `,
      {
        replacements: { id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!result) {
      return res.status(404).json({ error: "Examination not found" });
    }

    const { subjects, centers, ...examinationData } = result;

    res.status(200).json({
      message: "Examination fetched successfully",
      data: {
        examination: examinationData,
        subjects: subjects,
        centers: centers,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching examination: " + err.message });
  }
};

export const getAllExaminations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const examinations = await sequelize.query(
      `SELECT * FROM public.examinations ORDER BY "createdAt_ts" DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: { limit, offset },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const [totalResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM public.examinations`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const total = parseInt(totalResult.count);

    res.status(200).json({
      message: "Examinations fetched successfully",
      data: examinations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching examinations: " + err.message });
  }
};

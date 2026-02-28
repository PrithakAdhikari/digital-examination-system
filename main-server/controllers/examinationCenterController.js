import Joi from "joi";
import ExaminationCenter from "../models/ExaminationCenter.js";
import sequelize from "../database.js";
import { Sequelize } from "sequelize";

// Joi schema for validation
const examinationCenterSchema = Joi.object({
  center_name_txt: Joi.string().max(255).required(),
  whitelist_ip: Joi.string().max(255).allow(null, ""),
  whitelist_url: Joi.string().max(255).allow(null, ""),
});

export const createCenter = async (req, res) => {
  const { error, value } = examinationCenterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const center = await ExaminationCenter.create(value);
    res.status(201).json({
      message: "Examination center created successfully",
      data: center,
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating center: " + err.message });
  }
};

export const getAllCenters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const centers = await sequelize.query(
      `SELECT * FROM public."ExaminationCenter" ORDER BY "createdAt_ts" DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: { limit, offset },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const [totalResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM public."ExaminationCenter"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const total = parseInt(totalResult.count);

    res.status(200).json({
      message: "Centers fetched successfully",
      data: centers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching centers: " + err.message });
  }
};

export const getCenterById = async (req, res) => {
  const { id } = req.params;
  try {
    const [center] = await sequelize.query(
      `SELECT * FROM public."ExaminationCenter" WHERE id = :id`,
      {
        replacements: { id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!center) {
      return res.status(404).json({ error: "Examination center not found" });
    }
    res.status(200).json({
      message: "Center found successfully",
      data: center,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching center: " + err.message });
  }
};

export const updateCenter = async (req, res) => {
  const { id } = req.params;
  const { error, value } = examinationCenterSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const center = await ExaminationCenter.findByPk(id);
    if (!center) {
      return res.status(404).json({ error: "Examination center not found" });
    }

    await center.update(value);
    res.status(200).json({
      message: "Center updated successfully",
      data: center,
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating center: " + err.message });
  }
};

export const patchCenter = async (req, res) => {
  const { id } = req.params;
  const patchSchema = Joi.object({
    center_name_txt: Joi.string().max(255).optional(),
    whitelist_ip: Joi.string().max(255).allow(null, "").optional(),
    whitelist_url: Joi.string().max(255).allow(null, "").optional(),
  });

  const { error, value } = patchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const center = await ExaminationCenter.findByPk(id);
    if (!center) {
      return res.status(404).json({ error: "Examination center not found" });
    }

    await center.update(value);
    res.status(200).json({
      message: "Center updated successfully",
      data: center,
    });
  } catch (err) {
    res.status(500).json({ error: "Error patching center: " + err.message });
  }
};

export const deleteCenter = async (req, res) => {
  const { id } = req.params;
  try {
    const center = await ExaminationCenter.findByPk(id);
    if (!center) {
      return res.status(404).json({ error: "Examination center not found" });
    }

    await center.destroy();
    res.status(200).json({
      message: "Center deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Error deleting center: " + err.message });
  }
};

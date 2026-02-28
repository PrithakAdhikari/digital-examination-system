import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const ExaminationSubject = sequelize.define(
  "ExaminationSubject",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    exam_setter_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    exam_batch_year: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    full_marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pass_marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "ExaminationSubject", 
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default ExaminationSubject;
import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const ExamStudent = sequelize.define(
  "ExamStudent",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_fk_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    student_fk_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
  },
  {
    tableName: "ExamStudent",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default ExamStudent;

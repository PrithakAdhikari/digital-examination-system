import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const StudentAnswerMarks = sequelize.define(
  "StudentAnswerMarks",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    stud_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    stud_answer_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    marks_obtained: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    tableName: "StudentAnswerMarks",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default StudentAnswerMarks;

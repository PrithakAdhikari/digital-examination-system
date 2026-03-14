import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const StudentQuestionAnswer = sequelize.define(
  "StudentQuestionAnswer",
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
    exam_question_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    stud_answer: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    exam_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    subject_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  },
  {
    tableName: "StudentQuestionAnswer",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default StudentQuestionAnswer;

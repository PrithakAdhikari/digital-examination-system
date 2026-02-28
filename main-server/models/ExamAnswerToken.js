import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const ExamAnswerToken = sequelize.define(
  "ExamAnswerToken",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    question_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    answer_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    aes_256_key: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    tableName: "ExamAnswerToken",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default ExamAnswerToken;

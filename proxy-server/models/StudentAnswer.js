import sequelizeSqlite from "../sqliteDatabase.js";
import { DataTypes } from "sequelize";

const StudentAnswer = sequelizeSqlite.define(
  "StudentAnswer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    stud_user_fk_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_question_fk_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stud_answer: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    exam_fk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subject_fk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_synced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "StudentAnswer",
    timestamps: true,
  }
);

export default StudentAnswer;

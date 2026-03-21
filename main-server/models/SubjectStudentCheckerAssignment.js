import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const SubjectStudentCheckerAssignment = sequelize.define(
  "SubjectStudentCheckerAssignment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    subject_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    student_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    checker_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "SubjectStudentCheckerAssignment",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
    indexes: [
      {
        unique: true,
        fields: ["subject_fk_id", "student_user_fk_id"],
        name: "subject_student_unique_index",
      },
      {
        fields: ["checker_user_fk_id", "subject_fk_id"],
        name: "checker_subject_index",
      },
    ],
  }
);

export default SubjectStudentCheckerAssignment;
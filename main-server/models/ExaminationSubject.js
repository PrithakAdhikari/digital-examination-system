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
    subject_name_txt: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    exam_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    exam_setter_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    full_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pass_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_startTime_ts: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
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
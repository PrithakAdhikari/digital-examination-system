import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Examination = sequelize.define(
  "Examination",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_name_txt: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    creator_user_fk_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    exam_startTime_ts: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    result_time_ts: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    center_fk_list: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "examinations",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default Examination;

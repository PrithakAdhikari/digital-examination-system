import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const ExaminationCenter = sequelize.define(
  "ExaminationCenter",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    center_name_txt: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    whitelist_ip: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    whitelist_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "ExaminationCenter",
    timestamps: true,
    createdAt: "createdAt_ts",
    updatedAt: "updatedAt_ts",
  }
);

export default ExaminationCenter;

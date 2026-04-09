import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const OnboardingInstitution = sequelize.define(
  "OnboardingInstitution",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name_txt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "onboarding_institutions",
  }
);

export default OnboardingInstitution;

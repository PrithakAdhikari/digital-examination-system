import { DataTypes, INTEGER } from "sequelize";
import sequelize from "../database.js";

const Token = sequelize.define("Token", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Token;

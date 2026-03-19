import { DataTypes, INTEGER } from "sequelize";
import sequelizeSqlite from "../sqliteDatabase.js";

const Token = sequelizeSqlite.define("Token", {
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

import { DataTypes } from "sequelize";
import sequelizeSqlite from "../sqliteDatabase.js";

const ProxySetting = sequelizeSqlite.define(
  "ProxySetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_center_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    provision_key: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true,
    },
    secret_key: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true,
    },
    main_server_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "http://localhost:8000"
    }
  },
  {
    tableName: "ProxySettings",
    timestamps: true,
  }
);

export default ProxySetting;

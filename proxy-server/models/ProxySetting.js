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
        defaultValue: "http://192.168.1.100:8000"
    },
    selected_examination_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    selected_examination_start_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    selected_subject_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
  },
  {
    tableName: "ProxySettings",
    timestamps: true,
  }
);

export default ProxySetting;

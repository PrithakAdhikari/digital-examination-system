import { DataTypes } from "sequelize";
import sequelizeSqlite from "../sqliteDatabase.js";

const Client = sequelizeSqlite.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    client_physical_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "offline", // online, offline
    },
    last_heartbeat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);

export default Client;

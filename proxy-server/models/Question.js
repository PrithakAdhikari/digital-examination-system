import { DataTypes } from "sequelize";
import sequelizeSqlite from "../sqliteDatabase.js";

const Question = sequelizeSqlite.define(
    "Question",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
        },
        paper_fk_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        question_txt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        question_type: {
            type: DataTypes.ENUM("LONG", "SHORT", "MCQ"),
            allowNull: false,
        },
        option1: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        option2: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        option3: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        option4: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "Questions",
        timestamps: true,
    }
);

export default Question;

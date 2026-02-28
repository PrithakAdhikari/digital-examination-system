import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const StudentSubjectMarks = sequelize.define(
    "StudentSubjectMarks",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        stud_user_fk_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        exam_subject_fk_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        marks_obtained: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "StudentSubjectMarks",
        timestamps: true,
        createdAt: "createdAt_ts",
        updatedAt: "updatedAt_ts",
    }
);

export default StudentSubjectMarks;

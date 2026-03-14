import sequelize from "../database.js";
import { Sequelize } from "sequelize";

/**
 * GET getAllExaminations
 * Fetches all of the examinations that this student (through req.user.id) has attended.
 */
export const getAllExaminations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const examinations = await sequelize.query(
            `
            SELECT 
                e.id,
                e.exam_name_txt,
                e."exam_startTime_ts",
                e.result_time_ts,
                es.status
            FROM public.examinations e
            JOIN public."ExamStudent" es ON es.exam_fk_id = e.id
            WHERE es.student_fk_id = :studentId;
            `,
            {
                replacements: { studentId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Student examinations fetched successfully",
            data: examinations,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching examinations: " + err.message });
    }
};

/**
 * GET getExaminationById
 * Get this specific examination with the current user's all details, like marks obtained, pass fail, and other relevant information.
 */
export const getExaminationById = async (req, res) => {
    try {
        const studentId = req.user.id;
        const examId = req.params.id;

        const [result] = await sequelize.query(
            `
            SELECT 
                e.id AS exam_id,
                e.exam_name_txt,
                e."exam_startTime_ts",
                e.result_time_ts,
                json_agg(
                    json_build_object(
                        'subject_id', es.id,
                        'subject_name_txt', es.subject_name_txt,
                        'full_marks', es.full_marks,
                        'pass_marks', es.pass_marks,
                        'marks_obtained', sam.marks_obtained,
                        'feedback', sam.feedback,
                        'status', CASE 
                            WHEN sam.marks_obtained IS NULL THEN 'PENDING'
                            WHEN sam.marks_obtained >= es.pass_marks THEN 'PASS' 
                            ELSE 'FAIL' 
                        END
                    )
                ) AS subjects,
                SUM(sam.marks_obtained) AS total_marks_obtained,
                SUM(es.full_marks) AS total_full_marks
            FROM public.examinations e
            JOIN public."ExaminationSubject" es ON e.id = es.exam_fk_id
            JOIN public."ExamStudent" est ON e.id = est.exam_fk_id AND est.student_fk_id = :studentId
            LEFT JOIN public."StudentAnswerMarks" sam ON es.id = sam.subject_fk_id AND sam.stud_user_fk_id = :studentId
            WHERE e.id = :examId
            GROUP BY e.id;
            `,
            {
                replacements: { studentId, examId },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!result) {
            return res.status(404).json({ error: "Examination not found or you have not attended it." });
        }

        res.status(200).json({
            message: "Examination details fetched successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching examination details: " + err.message });
    }
};

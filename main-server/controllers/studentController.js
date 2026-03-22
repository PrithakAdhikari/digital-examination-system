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
                MIN(esub."exam_startTime_ts") AS exam_startTime_ts,
                e.result_time_ts,
                es.status
            FROM public.examinations e
            JOIN public."ExamStudent" es ON es.exam_fk_id = e.id
            LEFT JOIN public."ExaminationSubject" esub ON esub.exam_fk_id = e.id
            WHERE es.student_fk_id = :studentId
            GROUP BY e.id, es.status;
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
            WITH SubjectMarks AS (
                SELECT 
                    subject_fk_id,
                    stud_user_fk_id,
                    SUM(marks_obtained) AS marks_obtained,
                    string_agg(feedback, ' | ') AS combined_feedback
                FROM public."StudentAnswerMarks"
                WHERE stud_user_fk_id = :studentId
                GROUP BY subject_fk_id, stud_user_fk_id
            ),
            SubjectFullMarks AS (
                SELECT 
                    sp.subject_fk_id,
                    SUM(pq.full_marks) AS total_subject_full_marks
                FROM public."SubjectPaper" sp
                JOIN public."PaperQuestion" pq ON sp.id = pq.paper_fk_id
                GROUP BY sp.subject_fk_id
            )
            SELECT 
                e.id AS exam_id,
                e.exam_name_txt,
                MIN(es."exam_startTime_ts") AS exam_startTime_ts,
                e.result_time_ts,
                json_agg(
                    json_build_object(
                        'subject_id', es.id,
                        'subject_name_txt', es.subject_name_txt,
                        'exam_startTime_ts', es."exam_startTime_ts",
                        'full_marks', COALESCE(sfm.total_subject_full_marks, 0),
                        'pass_marks', es.pass_marks,
                        'marks_obtained', COALESCE(sm.marks_obtained, 0),
                        'feedback', sm.combined_feedback,
                        'status', CASE 
                            WHEN sm.marks_obtained IS NULL THEN 'PENDING'
                            WHEN sm.marks_obtained >= es.pass_marks THEN 'PASS' 
                            ELSE 'FAIL' 
                        END
                    )
                ) AS subjects,
                SUM(COALESCE(sm.marks_obtained, 0)) AS total_marks_obtained,
                SUM(COALESCE(sfm.total_subject_full_marks, 0)) AS total_full_marks
            FROM public.examinations e
            JOIN public."ExaminationSubject" es ON e.id = es.exam_fk_id
            JOIN public."ExamStudent" est ON e.id = est.exam_fk_id AND est.student_fk_id = :studentId
            LEFT JOIN SubjectMarks sm ON es.id = sm.subject_fk_id
            LEFT JOIN SubjectFullMarks sfm ON es.id = sfm.subject_fk_id
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

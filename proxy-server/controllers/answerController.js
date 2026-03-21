import StudentAnswer from "../models/StudentAnswer.js";
import mainServerClient from "../utils/mainServerClient.js";

/**
 * submitAnswer
 * Stores a student's answer in the local SQLite database.
 */
export const submitAnswer = async (req, res) => {
    const { stud_user_fk_id, exam_question_fk_id, stud_answer, exam_fk_id, subject_fk_id } = req.body;

    if (!stud_user_fk_id || !exam_question_fk_id || !stud_answer) {
        return res.status(400).json({ error: "Required fields missing." });
    }

    try {
        // Upsert logic for current answer
        const [answer, created] = await StudentAnswer.upsert({
            stud_user_fk_id,
            exam_question_fk_id,
            stud_answer,
            exam_fk_id,
            subject_fk_id,
            is_synced: false,
        });

        res.status(200).json({
            message: created ? "Answer stored locally." : "Answer updated locally.",
            data: answer,
        });
    } catch (err) {
        console.error("Error storing answer locally:", err.message);
        res.status(500).json({ error: "Error storing answer: " + err.message });
    }
};

/**
 * syncAnswersToMain
 * Fetches unsynced answers and sends them to the Main Server in bulk.
 */
export const syncAnswersToMain = async (req, res) => {
    try {
        const unsynced = await StudentAnswer.findAll({
            where: { is_synced: false },
        });

        if (unsynced.length === 0) {
            return res.status(200).json({ message: "Everything is already synced." });
        }

        const payload = {
            answers: unsynced.map(a => ({
                stud_user_fk_id: a.stud_user_fk_id,
                exam_question_fk_id: a.exam_question_fk_id,
                stud_answer: a.stud_answer,
                exam_fk_id: a.exam_fk_id,
                subject_fk_id: a.subject_fk_id,
            }))
        };

        const response = await mainServerClient.post("/proxy/bulk-create-answers", payload);

        if (response.status === 200) {
            // Update local status
            await StudentAnswer.update(
                { is_synced: true },
                { where: { id: unsynced.map(a => a.id) } }
            );

            res.status(200).json({
                message: `Successfully synced ${unsynced.length} answers to Main Server.`,
            });
        } else {
            res.status(500).json({ error: "Main Server returned an error during sync." });
        }
    } catch (err) {
        console.error("Sync error:", err.message);
        res.status(500).json({ error: "Failed to sync answers: " + err.message });
    }
};

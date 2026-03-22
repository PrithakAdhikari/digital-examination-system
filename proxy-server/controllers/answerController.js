import StudentAnswer from "../models/StudentAnswer.js";
import Question from "../models/Question.js";
import mainServerClient from "../utils/mainServerClient.js";
import { encrypt, decrypt, generateSignature, verifySignature } from "../utils/encryption.js";

/**
 * submitAnswer
 * Stores a student's answer in the local SQLite database.
 * The answer is stored encrypted with an HMAC signature.
 */
export const submitAnswer = async (req, res) => {
    let { stud_user_fk_id, exam_question_fk_id, stud_answer, exam_fk_id, subject_fk_id } = req.body;

    if (!stud_user_fk_id || !exam_question_fk_id || !stud_answer) {
        return res.status(400).json({ error: "Required fields missing." });
    }

    try {
        // Resolve subject and exam ID from local questions if we don't have them yet or they are placeholders (1)
        if (!exam_fk_id || exam_fk_id == 1 || !subject_fk_id || subject_fk_id == 1) {
            const questionData = await Question.findByPk(exam_question_fk_id);
            if (questionData) {
                exam_fk_id = questionData.exam_fk_id;
                subject_fk_id = questionData.subject_fk_id;
            }
        }
        // Convert answer to string for encryption (it might be JSON or string)
        const answerString = typeof stud_answer === "string" ? stud_answer : JSON.stringify(stud_answer);
        
        // Encrypt the answer
        const encryptedAnswer = encrypt(answerString);
        
        // Generate HMAC signature of the encrypted content
        const signature = generateSignature(encryptedAnswer);

        // Upsert logic for current answer
        const [answer, created] = await StudentAnswer.upsert({
            stud_user_fk_id,
            exam_question_fk_id,
            stud_answer: encryptedAnswer,
            hmac_signature: signature,
            exam_fk_id,
            subject_fk_id,
            is_synced: false,
        });

        res.status(200).json({
            message: created ? "Answer stored securely." : "Answer updated securely.",
            data: { id: answer.id, status: "securely_stored" },
        });
    } catch (err) {
        console.error("Error storing answer locally:", err.message);
        res.status(500).json({ error: "Error storing answer: " + err.message });
    }
};

/**
 * syncAnswersToMain
 * Fetches unsynced answers, verifies integrity, decrypts, and sends to Main Server.
 */
export const syncAnswersToMain = async (req, res) => {
    try {
        const unsynced = await StudentAnswer.findAll({
            where: { is_synced: false },
        });

        if (unsynced.length === 0) {
            return res.status(200).json({ message: "Everything is already synced." });
        }

        const validAnswers = [];
        const tamperedIds = [];

        for (const record of unsynced) {
            // Verify HMAC signature before processing
            if (!verifySignature(record.stud_answer, record.hmac_signature)) {
                console.error(`[Security] Tampering detected in answer ID: ${record.id}`);
                tamperedIds.push(record.id);
                continue;
            }

            try {
                // Decrypt the answer for the main server
                const decryptedAnswer = decrypt(record.stud_answer);
                
                // Parse back to JSON if it was originally JSON
                let finalAnswer = decryptedAnswer;
                try {
                    finalAnswer = JSON.parse(decryptedAnswer);
                } catch (e) {
                    // Keep as string if it's not JSON
                }

                validAnswers.push({
                    stud_user_fk_id: record.stud_user_fk_id,
                    exam_question_fk_id: record.exam_question_fk_id,
                    stud_answer: finalAnswer,
                    exam_fk_id: record.exam_fk_id,
                    subject_fk_id: record.subject_fk_id,
                    local_id: record.id
                });
            } catch (decryptionError) {
                console.error(`[Security] Decryption failed for answer ID: ${record.id}`);
                tamperedIds.push(record.id);
            }
        }

        if (validAnswers.length === 0) {
            return res.status(400).json({ 
                error: "No valid answers to sync. Potential data tampering detected.",
                tampered_records: tamperedIds 
            });
        }

        const payload = {
            answers: validAnswers.map(a => ({
                stud_user_fk_id: a.stud_user_fk_id,
                exam_question_fk_id: a.exam_question_fk_id,
                stud_answer: a.stud_answer,
                exam_fk_id: a.exam_fk_id,
                subject_fk_id: a.subject_fk_id,
            }))
        };

        const response = await mainServerClient.post("/proxy/bulk-create-answers", payload);

        if (response.status === 200 || response.status === 201) {
            // Update local status ONLY for valid answers that were sent
            const successfullySyncedIds = validAnswers.map(a => a.local_id);
            await StudentAnswer.update(
                { is_synced: true },
                { where: { id: successfullySyncedIds } }
            );

            res.status(200).json({
                message: `Successfully synced ${successfullySyncedIds.length} answers to Main Server.`,
                tampered_records: tamperedIds.length > 0 ? tamperedIds : undefined
            });
        } else {
            res.status(500).json({ error: "Main Server returned an error during sync." });
        }
    } catch (err) {
        console.error("Sync error:", err.message);
        res.status(500).json({ error: "Failed to sync answers: " + err.message });
    }
};

/**
 * getUnsyncedAnswers
 * Fetches all un-synced answers from the local SQLite database.
 */
export const getUnsyncedAnswers = async (req, res) => {
    try {
        const unsynced = await StudentAnswer.findAll({
            where: { is_synced: false },
            order: [["createdAt", "DESC"]],
            limit: 50, // Limit to recent 50 for UI
        });

        res.status(200).json({
            message: "Unsynced answers fetched.",
            data: unsynced,
        });
    } catch (err) {
        console.error("Error fetching unsynced answers:", err.message);
        res.status(500).json({ error: "Failed to fetch unsynced answers: " + err.message });
    }
};

/**
 * getUnsyncedCount
 * Returns the total count of un-synced answers.
 */
export const getUnsyncedCount = async (req, res) => {
    try {
        const count = await StudentAnswer.count({
            where: { is_synced: false },
        });

        res.status(200).json({
            count,
        });
    } catch (err) {
        console.error("Error fetching unsynced count:", err.message);
        res.status(500).json({ error: "Failed to fetch unsynced count." });
    }
};


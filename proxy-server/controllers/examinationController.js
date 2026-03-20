import cron from "node-cron";
import mainServerClient from "../utils/mainServerClient.js";
import ProxySetting from "../models/ProxySetting.js";
import Question from "../models/Question.js";

const activeCronJobs = {};

/**
 * Fetches available examinations for this proxy from the main server.
 */
export const getExaminations = async (req, res) => {
    try {
        const response = await mainServerClient.get("/proxy/examinations");
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Error fetching examinations from main server:", err.message);
        res.status(500).json({ error: "Failed to fetch examinations from main server: " + err.message });
    }
};

/**
 * Selects an examination and starts a cron job to fetch questions.
 */
export const selectExamination = async (req, res) => {
    const { examId, startTime } = req.body;
    if (!examId || !startTime) {
        return res.status(400).json({ error: "examId and startTime are required" });
    }

    try {
        const setting = await ProxySetting.findOne();
        if (!setting) {
            return res.status(404).json({ error: "Proxy settings not found" });
        }

        await setting.update({ 
            selected_examination_id: examId,
            selected_examination_start_time: startTime
        });

        // Start cron job (it will check the time inside)
        startQuestionFetchCron(examId);

        res.status(200).json({
            message: `Examination ${examId} selected. Question fetcher scheduled.`,
            examId,
        });
    } catch (err) {
        res.status(500).json({ error: "Error selecting examination: " + err.message });
    }
};

/**
 * Periodically attempts to fetch and store questions for an examination.
 */
export const fetchAndStoreQuestions = async (examId) => {
    try {
        const setting = await ProxySetting.findOne();
        if (!setting || setting.selected_examination_id != examId) return;

        const startTime = new Date(setting.selected_examination_start_time);
        const now = new Date();

        if (now < startTime) {
            console.log(`[Cron] Skipping fetch for exam ${examId}. Exam starts at ${startTime.toLocaleString()}. Current time: ${now.toLocaleString()}`);
            return;
        }

        console.log(`[Cron] Attempting to fetch questions for examination ${examId}...`);
        const response = await mainServerClient.get(`/proxy/get-questions/${examId}`);
        
        if (response.status === 200 && response.data.decrypted) {
            const questions = response.data.data;
            
            // Store in SQLite
            for (const q of questions) {
                await Question.upsert({
                    id: q.id,
                    paper_fk_id: q.paper_fk_id,
                    question_txt: q.question_txt,
                    question_type: q.question_type,
                    option1: q.option1,
                    option2: q.option2,
                    option3: q.option3,
                    option4: q.option4,
                });
            }

            console.log(`[Cron] Successfully fetched and stored ${questions.length} questions for exam ${examId}.`);
            
            // Stop cron job
            if (activeCronJobs[examId]) {
                activeCronJobs[examId].stop();
                delete activeCronJobs[examId];
                console.log(`[Cron] Stopped cron job for exam ${examId}.`);
            }
        } else {
            console.log(`[Cron] Questions for exam ${examId} are not yet decrypted (StartTime not reached).`);
        }
    } catch (err) {
        console.error(`[Cron] Error fetching questions for exam ${examId}:`, err.message);
    }
};

/**
 * Schedules a cron job for an examination.
 */
export const startQuestionFetchCron = (examId) => {
    if (activeCronJobs[examId]) {
        activeCronJobs[examId].stop();
    }

    // Run every minute
    const job = cron.schedule("* * * * *", () => {
        fetchAndStoreQuestions(examId);
    });

    activeCronJobs[examId] = job;
    console.log(`[Cron] Scheduled question fetcher for exam ${examId} every minute.`);
    
    // Run immediately once
    fetchAndStoreQuestions(examId);
};

/**
 * Fetches all locally stored questions.
 */
export const getLocalQuestions = async (req, res) => {
    try {
        const questions = await Question.findAll({ order: [['id', 'ASC']] });
        res.status(200).json({ data: questions });
    } catch (err) {
        res.status(500).json({ error: "Error fetching local questions: " + err.message });
    }
};

/**
 * Re-initializes cron jobs on server startup for any selected examination that lacks questions.
 */
export const initializeCronJobs = async () => {
    try {
        const setting = await ProxySetting.findOne();
        if (setting && setting.selected_examination_id) {
            const examId = setting.selected_examination_id;
            
            // Check if questions already exist
            const count = await Question.count();
            if (count === 0) {
                console.log(`[Startup] Recalculating cron job for selected exam ${examId}.`);
                startQuestionFetchCron(examId);
            } else {
                console.log(`[Startup] Questions already exist locally for exam ${examId}. Not starting cron.`);
            }
        }
    } catch (err) {
        console.error("Error initializing cron jobs on startup:", err.message);
    }
};
/**
 * Removes the selected examination and stops the cron job.
 */
export const removeExamination = async (req, res) => {
    try {
        const setting = await ProxySetting.findOne();
        if (!setting) {
            return res.status(404).json({ error: "Proxy settings not found" });
        }

        const examId = setting.selected_examination_id;
        
        // Update settings
        await setting.update({ 
            selected_examination_id: null,
            selected_examination_start_time: null
        });

        // Stop cron job
        if (examId && activeCronJobs[examId]) {
            activeCronJobs[examId].stop();
            delete activeCronJobs[examId];
            console.log(`[Manual] Stopped cron job for exam ${examId} as it was removed.`);
        }

        // Optionally clear local questions
        await Question.destroy({ where: {}, truncate: true });

        res.status(200).json({ message: "Examination removed successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error removing examination: " + err.message });
    }
};

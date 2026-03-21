import DockerPool from '../utils/DockerPool.js';

export const runCode = async (req, res) => {
    const { code, language } = req.body;

    console.log("[runCodeController] Received request to run code.")

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required.' });
    }

    console.log("[runCodeController] Code: ", code)
    console.log("[runCodeController] Language: ", language)

    try {
        const result = await DockerPool.execute(code, language);
        res.json(result);
    } catch (error) {
        console.error('[runCodeController] Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while running the code.',
            details: error.message 
        });
    }
};

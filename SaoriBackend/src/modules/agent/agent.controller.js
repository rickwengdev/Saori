const AgentService = require('./agent.service');

exports.chat = async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }

    try {
        const reply = await AgentService.chat(sessionId, message);
        res.json({ success: true, reply });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
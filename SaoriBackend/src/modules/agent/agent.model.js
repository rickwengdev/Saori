const db = require('../../shared/database/db');
const Logger = require('../../shared/utils/Logger');

class AgentConversation {
    static async addMessage(sessionId, role, content) {
        try {
            await db.query(
                'INSERT INTO Conversations (session_id, role, content) VALUES (?, ?, ?)', 
                [sessionId, role, content]
            );
        } catch (err) {
            Logger.error(`[AgentModel] Failed to save message: ${err.message}`);
            // 不拋出錯誤，避免因為存 log 失敗導致回答中斷
        }
    }

    static async getHistory(sessionId, limit = 10) {
        try {
            const [rows] = await db.query(
                'SELECT role, content FROM Conversations WHERE session_id = ? ORDER BY created_at ASC LIMIT ?',
                [sessionId, limit]
            );
            return rows;
        } catch (err) {
            Logger.error(`[AgentModel] Failed to get history: ${err.message}`);
            return [];
        }
    }
}

module.exports = AgentConversation;
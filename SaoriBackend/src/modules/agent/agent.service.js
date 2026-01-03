const { GoogleGenerativeAI } = require("@google/generative-ai");
const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');
const Logger = require('../../shared/utils/Logger');
const AgentModel = require('./agent.model');

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AgentService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // 指向專案根目錄 (從 src/modules/agent 往上跳 3 層)
        this.projectRoot = path.resolve(__dirname, '../../..');
    }

    async _readCodebase() {
        try {
            const files = await glob.glob('src/**/*.{js,json,md}', {
                cwd: this.projectRoot,
                ignore: ['node_modules/**', 'logs/**', 'certs/**'],
                nodir: true
            });

            let context = "--- CURRENT PROJECT CODEBASE ---\n";
            for (const file of files) {
                const filePath = path.join(this.projectRoot, file);
                const content = await fs.readFile(filePath, 'utf-8');
                context += `File: ${file}\n\`\`\`javascript\n${content}\n\`\`\`\n\n`;
            }
            return context;
        } catch (error) {
            Logger.error(`[AgentService] Read codebase error: ${error.message}`);
            return "";
        }
    }

    async chat(sessionId, message) {
        try {
            const history = await AgentModel.getHistory(sessionId);
            
            // 建構 Gemini 歷史格式
            const chatHistory = history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            }));

            let systemInstruction = "你是 Saori，一個全能的後端 AI 助手。請用繁體中文回答。";
            
            // 簡單的關鍵字檢測是否需要 RAG
            if (message.includes('代碼') || message.includes('API') || message.includes('結構')) {
                const codebase = await this._readCodebase();
                systemInstruction += `\n\n你擁有讀取專案代碼的權限。目前的代碼庫如下：\n${codebase}`;
            }

            const chat = this.model.startChat({
                history: chatHistory,
                systemInstruction: systemInstruction
            });

            const result = await chat.sendMessage(message);
            const responseText = result.response.text();

            // 異步存檔
            await AgentModel.addMessage(sessionId, 'user', message);
            await AgentModel.addMessage(sessionId, 'model', responseText);

            return responseText;

        } catch (error) {
            Logger.error(`[AgentService] Chat Error: ${error.message}`);
            throw new Error('Saori is thinking too hard and crashed.');
        }
    }
}

module.exports = new AgentService();
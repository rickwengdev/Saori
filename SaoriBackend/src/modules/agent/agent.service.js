const OpenAI = require("openai"); // 改用 OpenAI SDK
const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');
const Logger = require('../../shared/utils/Logger');
const AgentModel = require('./agent.model');

class AgentService {
    constructor() {
        // 初始化 OpenAI Client，但指向 Google 的 Gemini 接口
        this.client = new OpenAI({
            apiKey: process.env.GEMINI_API_KEY, // 維持使用 Gemini Key
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" // 關鍵：指向 Google 的 OpenAI 兼容層
        });

        // 指向專案根目錄 (從 src/modules/agent 往上跳 3 層)
        this.projectRoot = path.resolve(__dirname, '../../..');
    }

    /**
     * 讀取代碼庫 (RAG 核心) - 邏輯維持不變
     */
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

    /**
     * 對話核心
     */
    async chat(sessionId, message) {
        try {
            // 1. 讀取資料庫歷史紀錄
            const history = await AgentModel.getHistory(sessionId);
            
            // 2. 轉換格式：Database (user/model) -> OpenAI (user/assistant)
            const messages = history.map(h => ({
                role: h.role === 'model' ? 'assistant' : 'user', // OpenAI 不認得 'model'，要轉成 'assistant'
                content: h.content
            }));

            // 3. 準備 System Instruction
            let systemPrompt = "你是 Saori，一個全能的後端 AI 助手。請用繁體中文回答。";
            
            // RAG 判斷
            if (message.includes('代碼') || message.includes('API') || message.includes('結構') || message.includes('agent') || message.includes('功能')) {
                const codebase = await this._readCodebase();
                systemPrompt += `\n\n你擁有讀取專案代碼的權限。目前的代碼庫如下：\n${codebase}`;
            }

            // 4. 構建完整的訊息鏈 (System -> History -> User Query)
            const fullMessageChain = [
                { role: "system", content: systemPrompt },
                ...messages,
                { role: "user", content: message }
            ];

            // 5. 發送請求 (使用標準 OpenAI 寫法)
            const completion = await this.client.chat.completions.create({
                model: "gemini-1.5-flash", // 這裡依然指定 Gemini 模型
                messages: fullMessageChain,
            });

            const responseText = completion.choices[0].message.content;

            // 6. 存檔 (資料庫維持存 'model' 以保持一致性，或你也可以考慮以後改成 'assistant')
            await AgentModel.addMessage(sessionId, 'user', message);
            await AgentModel.addMessage(sessionId, 'model', responseText);

            return responseText;

        } catch (error) {
            Logger.error(`[AgentService] Chat Error: ${error.message}`);
            return `[系統錯誤] Saori 連線失敗: ${error.message}`;
        }
    }
}

module.exports = new AgentService();
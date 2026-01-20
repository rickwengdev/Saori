// src/services/api.js
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
import logger from '../utils/Logger.js';

dotenv.config();

const API_ENDPOINT = process.env.API_ENDPOINT;

if (!API_ENDPOINT) {
    logger.warn('⚠️ API_ENDPOINT is not defined in .env! API calls will fail.');
}

// 建立 Axios 實例
const api = axios.create({
    baseURL: API_ENDPOINT,
    timeout: 10000, // 設定 10 秒超時，避免請求卡死
    // 集中處理 SSL 問題 (只在開發環境允許忽略憑證)
    httpsAgent: new https.Agent({ 
        rejectUnauthorized: process.env.NODE_ENV === 'production' 
        // 如果你的 Cloud Run 是 HTTPS 且有正式憑證，生產環境應該設為 true
        // 如果是內網 IP 連線或自簽憑證，則保持 false
    }),
    headers: {
        'Content-Type': 'application/json',
        // 未來如果有 API Key，可以在這裡統一加
        // 'Authorization': `Bearer ${process.env.API_KEY}` 
    }
});

// 請求攔截器 (Request Interceptor)：發送前記錄 Log
api.interceptors.request.use(
    (config) => {
        // 記錄：[GET] /api/123456/config
        logger.debug(`📡 API Request: [${config.method.toUpperCase()}] ${config.url}`);
        return config;
    },
    (error) => {
        logger.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// 回應攔截器 (Response Interceptor)：收到後處理資料或錯誤
api.interceptors.response.use(
    (response) => {
        // 直接回傳 data，這樣呼叫端就不用再寫 response.data.data
        return response.data;
    },
    (error) => {
        // 統一錯誤處理邏輯
        if (error.response) {
            // 伺服器有回應，但狀態碼不是 2xx
            logger.warn(`⚠️ API Error [${error.response.status}]: ${error.response.data?.message || error.message}`);
        } else if (error.request) {
            // 請求發出去了，但沒收到回應 (例如斷網)
            logger.error('❌ API No Response:', error.message);
        } else {
            // 設定請求時出錯
            logger.error('❌ API Config Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
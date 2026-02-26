const { Pool } = require('pg');
const Logger = require('../utils/Logger');

// 1. 準備 PostgreSQL 連線設定物件
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'd=y7YTh]xQVFsLTC',
  database: process.env.DB_NAME || 'saori_db',
  max: 10, // 對應 mysql2 的 connectionLimit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 2. 根據環境變數設定連線方式
if (process.env.DB_HOST && process.env.NODE_ENV === 'production') {
    Logger.info(`[Database] Using PostgreSQL Unix Socket: ${process.env.DB_HOST}`);
    // 在 pg 套件中，Unix Socket 的路徑是直接傳給 host
    dbConfig.host = process.env.DB_HOST; 
} else {
    Logger.info(`[Database] Using TCP Host: ${process.env.DB_HOST || 'localhost'}`);
    dbConfig.host = process.env.DB_HOST || 'localhost';
    dbConfig.port = process.env.DB_PORT || 5432; // PostgreSQL 預設 port 是 5432
}

// 3. 建立連接池
const pool = new Pool(dbConfig);

// 4. 測試連接
const testConnection = async () => {
    try {
        const client = await pool.connect();
        Logger.info('[Database] ✅ Successfully connected to PostgreSQL');
        client.release(); // 記得釋放連線
    } catch (err) {
        Logger.error(`[Database] ❌ Connection failed: ${err.message}`);
    }
};

testConnection();

module.exports = pool;
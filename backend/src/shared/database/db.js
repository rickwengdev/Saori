const mysql = require('mysql2/promise');
const Logger = require('../utils/Logger');

// 1. 準備連線設定物件
const dbConfig = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'saori_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// 2. 根據環境變數設定連線方式
if (process.env.DB_HOST && process.env.NODE_ENV === 'production') {
    Logger.info(`[Database] Using Unix Socket: ${process.env.DB_HOST}`);
    dbConfig.socketPath = process.env.DB_HOST; 
} else {
    Logger.info(`[Database] Using TCP Host: ${process.env.DB_HOST || 'localhost'}`);
    dbConfig.host = process.env.DB_HOST || 'localhost';
    dbConfig.port = process.env.DB_PORT || 3306;
}

// 3. 建立連接池
const pool = mysql.createPool(dbConfig);

// 4. 測試連接
const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        Logger.info('[Database] ✅ Successfully connected to MariaDB/MySQL');
        conn.release();
    } catch (err) {
        Logger.error(`[Database] ❌ Connection failed: ${err.message}`);
    }
};

testConnection();

module.exports = pool;
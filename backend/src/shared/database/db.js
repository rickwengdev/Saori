const mysql = require('mysql2/promise');
const Logger = require('../utils/Logger');

// 建立連接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'saori_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 測試連接
pool.getConnection()
    .then(conn => {
        Logger.info('[Database] Successfully connected to MariaDB/MySQL');
        conn.release();
    })
    .catch(err => {
        Logger.error(`[Database] Connection failed: ${err.message}`);
    });

module.exports = pool;
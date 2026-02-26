const db = require('./db'); // 封裝的 PostgreSQL 連接模組 (使用 pg pool)
const Logger = require('../utils/Logger'); // 引入集中化 Logger

class DatabaseService {
  constructor() {
    this.tables = [
      {
        name: 'conversations',
        schema: `
          CREATE TABLE conversations (
              id SERIAL PRIMARY KEY,
              session_id VARCHAR(255) NOT NULL,
              role VARCHAR(50) CHECK (role IN ('user', 'model')) NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      },
      {
        name: 'servers',
        schema: `
          CREATE TABLE servers (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL UNIQUE,
            server_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      },
      {
        name: 'reactionroles',
        schema: `
          CREATE TABLE reactionroles (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            channel_id VARCHAR(255) NOT NULL,
            message_id VARCHAR(255) NOT NULL,
            emoji VARCHAR(255) NOT NULL,
            role_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'dynamicvoicechannels',
        schema: `
          CREATE TABLE dynamicvoicechannels (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            base_channel_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'logs',
        schema: `
          CREATE TABLE logs (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            log_channel_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'welcomeleaveconfig',
        schema: `
          CREATE TABLE welcomeleaveconfig (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            welcome_channel_id VARCHAR(255),
            leave_channel_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'trackingmembers',
        schema: `
          CREATE TABLE trackingmembers (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL UNIQUE,
            trackingmembers_channel_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      // 🔥 新增：等級與經驗值系統資料表
      {
        name: 'userlevels',
        schema: `
          CREATE TABLE userlevels (
            id SERIAL PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            xp INT DEFAULT 0,
            level INT DEFAULT 0,
            last_msg_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (server_id, user_id), -- 確保每個伺服器內，每個使用者只有一筆紀錄
            FOREIGN KEY (server_id) REFERENCES servers(server_id) ON DELETE CASCADE
          );
        `,
      }
    ];
  }

  // PostgreSQL 檢查單個表是否存在
  async isTableExists(tableName) {
    try {
      Logger.info(`[DatabaseService.isTableExists] Checking if table "${tableName}" exists`);
      
      // PostgreSQL 中，參數綁定使用 $1, $2，且資料表名稱預設會轉小寫
      const { rows } = await db.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
        `,
        [tableName.toLowerCase()]
      );
      
      const exists = rows[0].exists;
      Logger.info(`[DatabaseService.isTableExists] Table "${tableName}" exists: ${exists}`);
      return exists;
    } catch (error) {
      Logger.error(`[DatabaseService.isTableExists] Error checking table "${tableName}": ${error.message}`);
      throw error;
    }
  }

  // 創建單個表
  async createTable(schema) {
    try {
      Logger.info(`[DatabaseService.createTable] Creating table...`);
      await db.query(schema);
      Logger.info(`[DatabaseService.createTable] Table created successfully`);
    } catch (error) {
      Logger.error(`[DatabaseService.createTable] Error creating table: ${error.message}`);
      throw error;
    }
  }

  // 檢查並創建所有表
  async checkAndCreateAllTables() {
    for (const table of this.tables) {
      try {
        Logger.info(`[DatabaseService.checkAndCreateAllTables] Checking table "${table.name}"`);
        const exists = await this.isTableExists(table.name);
        if (!exists) {
          await this.createTable(table.schema);
        }
      } catch (error) {
        Logger.error(`[DatabaseService.checkAndCreateAllTables] Error processing table "${table.name}": ${error.message}`);
        throw error; 
      }
    }
  }
}

module.exports = new DatabaseService();
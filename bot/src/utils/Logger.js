// src/utils/Logger.js
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// 確保 logs 資料夾存在
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // 自動捕捉 Error 物件的 stack trace
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`
      : `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

// 建立 Logger 實例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // 1. Console 輸出 (開發時用)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // 2. 錯誤日誌 (自動輪替) - 只存 error 等級
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // 舊日誌壓縮
      maxSize: '20m',      // 單檔最大 20MB
      maxFiles: '14d',     // 保留 14 天
      level: 'error',
    }),

    // 3. 綜合日誌 (自動輪替) - 存 info 以上
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export default logger;
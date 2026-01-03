const winston = require('winston');

const Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'SaoriBackend' },
  transports: [
    // 寫入錯誤日誌檔案
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // 寫入所有日誌檔案
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 如果不是生產環境，也在控制台輸出
if (process.env.NODE_ENV !== 'production') {
  Logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
  }));
}

module.exports = Logger;
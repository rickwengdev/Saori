require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const Logger = require('./shared/utils/Logger');
const checkAndCreateTables = require('./shared/database/checkAndCreateTable');

const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(cors({ origin:process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { 
    stream: { write: (msg) => Logger.info(msg.trim()) } 
}));

// === 模組路由掛載 ===
// 在啟動時檢查並建立必要的資料庫表格
async function initializeApp() {
    Logger.info('初始化資料庫...');
    
    try {
        // 嘗試連接並建立表格
        await checkAndCreateTables.checkAndCreateAllTables();
        Logger.info('資料庫初始化完成');
    } catch (error) {
        Logger.error(`資料庫初始化失敗: ${error.message}`);
        console.error('Database Init Failed:', error); // 在控制台也顯示一下
    }

    // 無論資料庫是否成功，都回傳 app 實例
    return app;
}

// 2. Discord 相關模組
const authRoutes = require('./modules/discord/auth/auth.routes');
const botRoutes = require('./modules/discord/bot/bot.routes');
const channelRoutes = require('./modules/discord/channel/channel.routes');
const dynamicRoutes = require('./modules/discord/dynamic/dynamic.routes');
const logRoutes = require('./modules/discord/log/log.routes');
const reactionRoleRoutes = require('./modules/discord/reactionRole/reactionRole.routes');
const serverRoutes = require('./modules/discord/server/server.routes');
const trackingRoutes = require('./modules/discord/tracking/tracking.routes');
const userRoutes = require('./modules/discord/user/user.routes');
const welcomeLeaveRoutes = require('./modules/discord/welcomeleave/welcomeleave.routes');

app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/log', logRoutes);
app.use('/api/reaction-role', reactionRoleRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/welcome-leave', welcomeLeaveRoutes);

// 全局錯誤處理
app.use((err, req, res, next) => {
  Logger.error(`Global Error: ${err.stack}`);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = { app, initializeApp };
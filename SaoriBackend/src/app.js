require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Logger = require('./shared/utils/Logger');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.API_URL || '*', credentials: true }));
app.use(express.json());
// 將 HTTP 請求日誌導向我們的 Winston Logger
app.use(morgan('combined', { 
    stream: { write: (msg) => Logger.info(msg.trim()) } 
}));

// === 模組路由掛載 ===

// 1. Agent 模組 (AI 對話)
const agentRoutes = require('./modules/agent/agent.routes');
app.use('/api/agent', agentRoutes);

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

// 3. Blog 模組 (預留)
// const blogRoutes = require('./modules/blog/blog.routes');
// app.use('/api/blog', blogRoutes);

// 全局錯誤處理
app.use((err, req, res, next) => {
  Logger.error(`Global Error: ${err.stack}`);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
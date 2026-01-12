const express = require('express');
const router = express.Router();
const controller = require('./agent.controller');

/**
 * 處理 AI 對話相關的路由
 * POST /api/agent/chat
 */
router.post('/chat', controller.chat);

module.exports = router;
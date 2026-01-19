const express = require('express');
const userController = require('./user.controller');
const authenticateToken = require('../../../shared/middlewares/authenticateToken');

const router = express.Router();

/**
 * 獲取用戶資料
 * GET /user/guilds
 */
router.get('/guilds', authenticateToken, (req, res) => userController.getGuilds(req, res));

module.exports = router;
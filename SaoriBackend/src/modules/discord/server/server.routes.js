const express = require('express');
const serverController = require('./server.controller');
const authenticateToken = require('../../../shared/middlewares/authenticateToken');
const router = express.Router();

/**
 * 獲取伺服器信息
 * GET /server/:serverId
 */
router.get('/:serverId', authenticateToken, (req, res) => 
  serverController.getServerInfo(req, res)
);

/**
 * 獲取伺服器列表
 * GET /server
 */
router.post('/', authenticateToken, (req, res) => 
  serverController.createServer(req, res)
);

/**
 * 確保伺服器存在
 * POST /server/ensure
 */
router.post('/ensure', authenticateToken, (req, res) => 
  serverController.ensureServerExists(req, res)
);

// 刪除伺服器信息
router.delete('/:serverId', authenticateToken, (req, res) => 
  serverController.deleteServer(req, res)
);

module.exports = router;
const LogService = require('./log.service');
const Logger = require('../../../shared/utils/Logger'); // 引入集中化 Logger

class LogsController {
  /**
   * 獲取伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async getLogChannel(req, res) {
    const { serverId } = req.params;
    try {
      Logger.info(`Fetching log channel configuration for serverId: ${serverId}`);
      let config = await LogService.getLogChannel(serverId);
      if (!config) {
        Logger.warn(`Log channel not found for serverId: ${serverId}`);
        config = {
          server_id: serverId,
          log_channel_id: null, // 前端依此判斷顯示「請選擇頻道」
        };
      }
      Logger.info(`Successfully fetched log channel configuration for serverId: ${serverId}`);
      res.json({ success: true, config });
    } catch (error) {
      Logger.error(`Error fetching log channel for serverId ${serverId}: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch log channel' });
    }
  }

  /**
   * 設置或更新伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async setLogChannel(req, res) {
    const { serverId } = req.params;
    const { logChannelId } = req.body;

    if (!logChannelId) {
      Logger.warn('logChannelId is missing in the request body');
      return res.status(400).json({ message: 'logChannelId is required' });
    }
    try {
      Logger.info(`Setting log channel for serverId: ${serverId} with logChannelId: ${logChannelId}`);
      await LogService.setLogChannel(serverId, logChannelId);
      Logger.info(`Successfully set log channel for serverId: ${serverId}`);
      res.json({ success: true });
    } catch (error) {
      Logger.error(`Error setting log channel for serverId ${serverId}: ${error.message}`);
      res.status(500).json({ message: 'Failed to set log channel' });
    }
  }

  /**
   * 刪除伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async deleteLogChannel(req, res) {
    const { serverId } = req.params;

    try {
      Logger.info(`Deleting log channel configuration for serverId: ${serverId}`);
      await LogService.deleteLogChannel(serverId);
      Logger.info(`Successfully deleted log channel for serverId: ${serverId}`);
      res.json({ success: true });
    } catch (error) {
      Logger.error(`Error deleting log channel for serverId ${serverId}: ${error.message}`);
      res.status(500).json({ message: 'Failed to delete log channel' });
    }
  }
}

module.exports = new LogsController();
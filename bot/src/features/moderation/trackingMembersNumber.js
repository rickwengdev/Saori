import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class MemberTracker {
  constructor(client, interval = 60000) {
    this.client = client;
    this.interval = interval; // 預設 60 秒
    this.isRunning = false;   // 防止重複執行的鎖
    this.init();
  }

  init() {
    logger.info('Initializing MemberTracker...');
    // 啟動第一次迴圈
    this.scheduleNextRun(5000); // 啟動後 5 秒開始第一次
  }

  /**
   * 使用遞迴方式調度，確保絕對不會發生重疊執行 (防止 OOM)
   */
  scheduleNextRun(delay) {
    setTimeout(() => this.runUpdateCycle(), delay);
  }

  async runUpdateCycle() {
    if (this.isRunning) return; // 如果還在跑，就跳過
    this.isRunning = true;

    logger.info('🔄 Starting member count update cycle...');

    try {
      // 取得所有 Guild (使用 Array.from 轉成陣列以便迴圈)
      const guilds = Array.from(this.client.guilds.cache.values());

      for (const guild of guilds) {
        await this.updateChannelName(guild.id);
        
        // 🔥 關鍵：每個請求中間休息 2 秒，避免瞬間塞爆 CPU 和網路
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      logger.error('❌ Critical error in MemberTracker cycle:', error);
    } finally {
      this.isRunning = false;
      logger.info(`✅ Cycle finished. Sleeping for ${this.interval / 1000}s...`);
      
      // 🔥 只有在這次跑完後，才預約下一次 (這是防止崩潰的核心)
      this.scheduleNextRun(this.interval);
    }
  }

  async updateChannelName(guildId) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      // 檢查 Bot 是否有管理頻道權限
      const guildMe = guild.members.me || (await guild.members.fetch(this.client.user.id));
      if (!guildMe?.permissions.has('ManageChannels')) {
        // logger.warn(`Missing 'ManageChannels' permission in guild ${guildId}`);
        return;
      }

      const channelId = await this.getChannelId(guildId);
      if (!channelId) return;

      const channel = guild.channels.cache.get(channelId);
      if (!channel || channel.type !== 2) return; // 2 = Voice Channel

      const newName = `Members: ${guild.memberCount}`;
      
      // 只有當名字真的變了才改，避免觸發 Discord Rate Limit
      if (channel.name !== newName) {
        await channel.edit({ name: newName });
        logger.info(`Updated channel name for guild ${guildId} to: ${newName}`);
      }
    } catch (error) {
      // 這裡只記錄簡單錯誤，不要印出整個 stack trace 節省空間
      // logger.warn(`Failed to update guild ${guildId}: ${error.message}`);
    }
  }

  async getChannelId(guildId) {
    // 簡單的內存緩存，避免每次都打 API
    if (this.channelCache && this.channelCache.has(guildId)) {
      return this.channelCache.get(guildId);
    }

    try {
      // 🔥 Debug 用：印出完整的請求網址，幫你抓 404 原因
      // logger.debug(`Requesting: /api/tracking/${guildId}/trackingMembers`);
      
      const data = await api.get(`/api/tracking/${guildId}/trackingMembers`);
      const channelId = data?.config?.trackingmembers_channel_id || null;
      
      if (!this.channelCache) this.channelCache = new Map();
      this.channelCache.set(guildId, channelId);

      return channelId;
    } catch (error) {
      return null;
    }
  }
}

export default MemberTracker;
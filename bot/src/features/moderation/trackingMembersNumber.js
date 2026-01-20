import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class MemberTracker {
  constructor(client, interval = 60000) {
    this.client = client;
    this.channelCache = new Map();
    this.interval = interval;
    this.trackerInterval = null;
    this.init();
  }

  init() {
    logger.info('Initializing MemberTracker...');
    this.startTracking();
  }

  startTracking() {
    if (this.trackerInterval) clearInterval(this.trackerInterval);
    
    this.trackerInterval = setInterval(() => {
      this.client.guilds.cache.forEach(guild => {
        this.updateChannelName(guild.id);
      });
    }, this.interval);
  }

  stopTracking() {
    if (this.trackerInterval) {
      clearInterval(this.trackerInterval);
      this.trackerInterval = null;
    }
  }

  async updateChannelName(guildId) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      const guildMe = guild.members.me || (await guild.members.fetch(this.client.user.id));
      if (!guildMe?.permissions.has('ManageChannels')) return;

      const channelId = await this.getChannelId(guildId);
      if (!channelId) return;

      const channel = guild.channels.cache.get(channelId);
      if (!channel || channel.type !== 2) return;

      // 避免重複修改，先檢查名稱是否不同
      const newName = `Members: ${guild.memberCount}`;
      if (channel.name !== newName) {
        await channel.edit({ name: newName });
        logger.info(`Updated channel name for guild ${guildId} to: ${newName}`);
      }
    } catch (error) {
      logger.error(`Failed to update channel for guild ${guildId}: ${error.message}`);
    }
  }

  async getChannelId(guildId) {
    if (this.channelCache.has(guildId)) {
      return this.channelCache.get(guildId);
    }
  
    try {
      const data = await api.get(`/api/${guildId}/trackingMembers`);
      const channelId = data?.config?.trackingmembers_channel_id || null;
      this.channelCache.set(guildId, channelId);
      return channelId;
    } catch (error) {
      return null;
    }
  }

  destroy() {
    this.stopTracking();
  }
}

export default MemberTracker;
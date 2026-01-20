import { Events } from 'discord.js';
import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class GuildLogService {
    constructor(client) {
        this.client = client;
        this.init();
    }

    init() {
        this.client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
            this.handleNicknameChange(oldMember, newMember);
            this.handleRoleChange(oldMember, newMember);
        });

        this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
            this.handleVoiceStateUpdate(oldState, newState);
        });
    }

    async getLogChannelId(guildId) {
        try {
            const data = await api.get(`/api/log/${guildId}/log-channel`);
            return data?.config?.log_channel_id || null;
        } catch (error) {
            return null;
        }
    }

    async handleNicknameChange(oldMember, newMember) {
        if (oldMember.nickname === newMember.nickname) return;

        const guildId = newMember.guild.id;
        const logChannelId = await this.getLogChannelId(guildId);
        if (!logChannelId) return;

        const logChannel = newMember.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const oldNickname = oldMember.nickname || oldMember.user.username;
        const newNickname = newMember.nickname || newMember.user.username;

        try {
            await logChannel.send(`🔄 **${oldNickname}** changed their nickname to **${newNickname}**`);
        } catch (error) {
            logger.error(`Failed to log nickname change in ${guildId}:`, error);
        }
    }

    async handleVoiceStateUpdate(oldState, newState) {
        const guildId = newState.guild.id;
        // 簡單判斷：只處理進出，不處理靜音/開關麥克風
        if (oldState.channelId === newState.channelId) return;

        const logChannelId = await this.getLogChannelId(guildId);
        if (!logChannelId) return;

        const logChannel = newState.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        try {
            if (!oldState.channel && newState.channel) {
                // Join
                await logChannel.send(`🔊 **${newState.member.user.tag}** joined voice channel **${newState.channel.name}**`);
            } else if (oldState.channel && !newState.channel) {
                // Leave
                await logChannel.send(`🔇 **${oldState.member.user.tag}** left voice channel **${oldState.channel.name}**`);
            } else if (oldState.channel && newState.channel) {
                // Switch
                await logChannel.send(`🔄 **${newState.member.user.tag}** moved from **${oldState.channel.name}** to **${newState.channel.name}**`);
            }
        } catch (error) {
            logger.error(`Failed to log voice state in ${guildId}:`, error);
        }
    }

    async handleRoleChange(oldMember, newMember) {
        const guildId = newMember.guild.id;
        const logChannelId = await this.getLogChannelId(guildId);
        if (!logChannelId) return;

        const logChannel = newMember.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const oldRoles = new Set(oldMember.roles.cache.keys());
        const newRoles = new Set(newMember.roles.cache.keys());

        const addedRoles = [...newRoles].filter(role => !oldRoles.has(role));
        const removedRoles = [...oldRoles].filter(role => !newRoles.has(role));

        try {
            for (const roleId of addedRoles) {
                const role = newMember.guild.roles.cache.get(roleId);
                if (role) await logChannel.send(`➕ **${newMember.user.tag}** was given the role **${role.name}**`);
            }
            for (const roleId of removedRoles) {
                const role = newMember.guild.roles.cache.get(roleId);
                if (role) await logChannel.send(`➖ **${newMember.user.tag}** was removed from the role **${role.name}**`);
            }
        } catch (error) {
            logger.error(`Failed to log role change in ${guildId}:`, error);
        }
    }
}

export default GuildLogService;
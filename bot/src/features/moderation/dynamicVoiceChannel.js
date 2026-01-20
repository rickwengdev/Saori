import { PermissionsBitField } from 'discord.js';
import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class DynamicVoiceChannelManager {
    constructor(client) {
        this.client = client;
        this.init();
    }

    init() {
        this.client.on('voiceStateUpdate', (oldState, newState) => {
            this.handleVoiceStateUpdate(oldState, newState);
        });
    }

    async handleVoiceStateUpdate(oldState, newState) {
        try {
            const guildId = newState.guild.id;

            const triggerChannelId = await this.getTriggerChannelId(guildId);
            if (!triggerChannelId) return;

            // User joined trigger channel
            if (newState.channelId === triggerChannelId) {
                logger.info(`User joined trigger channel ${triggerChannelId} in guild ${guildId}.`);
                await this.createDynamicChannel(newState);
            }

            // Check if old channel needs to be deleted
            if (oldState.channel) {
                await this.deleteEmptyChannel(oldState.channel);
            }
        } catch (error) {
            logger.error('Error handling voice state update:', error);
        }
    }

    async getTriggerChannelId(guildId) {
        try {
            const data = await api.get(`/api/${guildId}/dynamic-voice-channels`);
            return data?.config?.base_channel_id || null;
        } catch (error) {
            return null;
        }
    }

    async createDynamicChannel(state) {
        const member = state.member;
        if (!member) return;

        let channelName = member.user.username.trim().replace(/[^a-zA-Z0-9\-_ ]/g, '');
        if (!channelName) channelName = 'Default Channel';

        try {
            const channel = await state.guild.channels.create({
                name: `${channelName}'s Channel`,
                type: 2, // Voice channel
                parent: state.channel.parentId,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.MuteMembers,
                            PermissionsBitField.Flags.DeafenMembers,
                        ],
                    },
                ],
            });

            await member.voice.setChannel(channel);
            logger.info(`Created dynamic channel ${channel.id} for ${member.user.tag} in guild ${state.guild.id}.`);
        } catch (error) {
            logger.error('Failed to create dynamic channel:', error);
        }
    }

    async deleteEmptyChannel(channel) {
        try {
            if (channel.members.size === 0 && channel.name.includes("'s Channel")) {
                await channel.delete();
                logger.info(`Deleted empty dynamic channel ${channel.id} in guild ${channel.guild.id}.`);
            }
        } catch (error) {
            logger.error('Failed to delete empty channel:', error);
        }
    }
}

export default DynamicVoiceChannelManager;
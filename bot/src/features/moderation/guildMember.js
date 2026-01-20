import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class GuildMembers {
    constructor(client) {
        this.client = client;
        this.registerEvents();
    }

    registerEvents() {
        this.client.on('guildMemberAdd', async (member) => {
            await this.handleGuildMemberAdd(member);
        });

        this.client.on('guildMemberRemove', async (member) => {
            await this.handleGuildMemberRemove(member);
        });
    }

    async fetchGuildConfig(guildId) {
        try {
            const data = await api.get(`/api/welcome-leave/${guildId}/getWelcomeLeave`);
            return data.config || null;
        } catch (error) {
            return null;
        }
    }

    async handleGuildMemberAdd(member) {
        try {
            const guildConfig = await this.fetchGuildConfig(member.guild.id);
            if (!guildConfig || !guildConfig.welcome_channel_id) return;
        
            const welcomeChannel = this.client.channels.cache.get(guildConfig.welcome_channel_id);
            if (!welcomeChannel) return;
        
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const welcomeBannerPath = path.join(__dirname, 'welcome-banner.png');
        
            let bannerBuffer = null;
            try {
                bannerBuffer = await fs.promises.readFile(welcomeBannerPath);
            } catch (e) {
                logger.warn('Welcome banner not found, skipping attachment.');
            }

            const embed = new EmbedBuilder()
                .setColor('#FFC0CB')
                .setTitle(`⭐ Welcome ${member.user.tag}! ⭐`)
                .setDescription(
                    `✨ welcome to ${member.guild.name} ✨\n\n` +
                    `This is a place full of possibilities and learning opportunities!\n\n` +
                    `🌟 We hope you find what you're looking for here! 🌟`
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }));

            if (bannerBuffer) {
                embed.setImage('attachment://welcome-banner.png');
            }

            const messageOptions = { embeds: [embed] };
            if (bannerBuffer) {
                messageOptions.files = [new AttachmentBuilder(bannerBuffer, { name: 'welcome-banner.png' })];
            }
        
            await welcomeChannel.send(messageOptions);
            logger.info(`Welcome message sent for ${member.user.tag} in ${member.guild.id}`);
        } catch (error) {
            logger.error(`Error sending welcome message in ${member.guild.id}:`, error);
        }
    }

    async handleGuildMemberRemove(member) {
        try {
            const guildConfig = await this.fetchGuildConfig(member.guild.id);
            if (!guildConfig || !guildConfig.leave_channel_id) return;

            const leaveChannel = this.client.channels.cache.get(guildConfig.leave_channel_id);
            if (!leaveChannel) return;

            await leaveChannel.send(`**${member.user.tag}** has left the server.`);
            logger.info(`Leave message sent for ${member.user.tag} in ${member.guild.id}`);
        } catch (error) {
            logger.error(`Error sending leave message in ${member.guild.id}:`, error);
        }
    }
}

export default GuildMembers;
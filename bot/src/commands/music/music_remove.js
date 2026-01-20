import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import MusicPlayer from '../../features/music/MusicPlayer.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('music_remove')
    .setDescription('Remove a song from the playlist')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('The URL of the song to remove from the playlist')
            .setRequired(true));

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const songUrl = interaction.options.getString('url');
        const player = new MusicPlayer(guildId);

        logger.info(`Cmd /music_remove by ${interaction.user.tag} in ${guildId} URL: ${songUrl}`);

        const playlist = player.getPlaylist();
        if (!playlist.includes(songUrl)) {
            return interaction.editReply(`❌ The song URL is not in the playlist.`);
        }

        player.removeSong(songUrl);

        // Try to fetch info for better UX
        let videoTitle = songUrl;
        let thumbnail = '';
        
        try {
            const info = await ytdl.getBasicInfo(songUrl);
            videoTitle = info?.videoDetails?.title || songUrl;
            thumbnail = info?.videoDetails?.thumbnails[0]?.url || '';
        } catch (e) {
            logger.warn(`Could not fetch info for removed song: ${songUrl}`);
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🗑️ Song Removed')
            .setDescription(`Removed: **${videoTitle}**`)
            .setThumbnail(thumbnail || null);

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to remove the song.');
    }
}
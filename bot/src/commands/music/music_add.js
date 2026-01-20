import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import MusicPlayer from '../../features/music/MusicPlayer.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

/**
 * Validate whether a given URL is a valid YouTube link
 */
async function isValidYoutubeUrl(url) {
    try {
        const info = await ytdl.getBasicInfo(url);
        const isPlayable = info?.videoDetails?.isPlayable;
        logger.debug(`URL validation for "${url}": ${isPlayable ? 'Playable' : 'Unplayable/Restricted'}`);
        return isPlayable;
    } catch (error) {
        logger.warn(`Invalid YouTube URL check: ${url} - ${error.message}`);
        return false;
    }
}

export const data = new SlashCommandBuilder()
    .setName('music_add')
    .setDescription('Add a song to a playlist')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('The URL of the song to add to the playlist')
            .setRequired(true));

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const songUrl = interaction.options.getString('url');
        const guildId = interaction.guild.id;

        logger.info(`Cmd /music_add by ${interaction.user.tag} in ${guildId} URL: ${songUrl}`);

        // Validate URL
        if (!await isValidYoutubeUrl(songUrl)) {
            await interaction.editReply(`❌ The provided URL is not a valid or playable YouTube video.`);
            return;
        }

        // Get video details (Fetched once here to avoid double fetching)
        const info = await ytdl.getBasicInfo(songUrl);
        const videoDetails = info.videoDetails;
        
        // Add to playlist
        const player = new MusicPlayer(guildId);
        player.addSong(songUrl);
        
        logger.info(`Added song to playlist [${guildId}]: ${videoDetails.title}`);

        // Prepare Description
        const rawDescription = videoDetails.description || '';
        const saveDescription = rawDescription.length > 200 
            ? rawDescription.slice(0, 200) + '...' 
            : rawDescription || 'No description available.';

        // Construct Embed
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(videoDetails.title)
            .setURL(songUrl)
            .setThumbnail(videoDetails.thumbnails[0]?.url || '')
            .setDescription(saveDescription);

        await interaction.editReply({ content: '✅ Song added to the playlist!', embeds: [embed] });

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to add the song to the playlist.');
    }
}
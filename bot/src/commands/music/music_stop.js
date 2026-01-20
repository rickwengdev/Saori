import { SlashCommandBuilder } from 'discord.js';
import MusicPlayer from '../../features/music/MusicPlayer.js/index.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('music_stop')
    .setDescription('Stop playing the current song');

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const userTag = interaction.user.tag;

        logger.info(`Cmd /music_stop by ${userTag} in ${guildId}`);

        const player = new MusicPlayer(guildId);
        const playlist = player.getPlaylist();

        // 這裡可以根據需求決定：即使播放清單是空的，是否也要強制執行 stop() 來斷開連線？
        // 目前保留你的邏輯：空清單就不停
        if (playlist.length === 0) {
            return await interaction.editReply('❌ No songs are currently playing (Playlist is empty).');
        }

        player.stop(interaction);

        logger.info(`Playback stopped by ${userTag} in ${guildId}`);
        await interaction.editReply('✅ Playback has been stopped, and the playlist cleared.');

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to stop playback.');
    }
}
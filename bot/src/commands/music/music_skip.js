import { SlashCommandBuilder } from 'discord.js';
import MusicPlayer from '../../features/music/MusicPlayer.js/index.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('music_skip')
    .setDescription('Skip to the next song');

export async function execute(interaction) {
    try {
        // Skip 通常不需要 deferReply，因為動作很快，但為了保險起見可以使用
        // 如果這裡沒 defer，後面的 ErrorHandler 需要知道
        
        const guildId = interaction.guild.id;
        const userTag = interaction.user.tag;

        logger.info(`Cmd /music_skip by ${userTag} in ${guildId}`);

        const player = new MusicPlayer(guildId);
        const playlist = player.getPlaylist();

        if (playlist.length === 0) {
            return await interaction.reply({ content: '❌ The playlist is empty, cannot skip.', ephemeral: true });
        }

        // Attempt to skip
        // 注意：handleNextSong 是一個 async 函數，建議 await
        // 且 handleNextSong 內部邏輯可能會呼叫 playSong，那邊會操作 interaction
        // 這裡我們假設 skip 只是觸發切歌
        const skipped = await player.handleNextSong(interaction);

        // 如果 handleNextSong 內部已經 reply 了，這裡就不要再 reply
        // 根據你之前的 MusicPlayer 邏輯，handleNextSong 會呼叫 playSong，playSong 會 editReply
        // 所以這裡我們傳送一個簡單的確認訊息即可
        
        if (!interaction.replied && !interaction.deferred) {
             await interaction.reply('⏭️ Skipping to the next song...');
        } else {
             await interaction.followUp('⏭️ Skipped!');
        }

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to skip song.');
    }
}
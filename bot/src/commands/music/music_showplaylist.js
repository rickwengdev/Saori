import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import MusicPlayer from '../../features/music/MusicPlayer.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('music_showplaylist')
    .setDescription('Show the current playlist');

export async function execute(interaction) {
    try {
        // 因為這裡有迴圈抓取資料，必須 defer
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const player = new MusicPlayer(guildId);
        const playlist = player.getPlaylist();

        if (playlist.length === 0) {
            return interaction.editReply('🎵 The playlist is currently empty!');
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🎶 Current Playlist')
            .setDescription('Here are the songs in the current playlist:');

        const fields = [];
        const MAX_DISPLAY = 10; // 建議改小一點，避免大量請求導致回應過慢或被 YouTube 封鎖 IP

        // 注意：這裡在迴圈內呼叫 API 是有效能風險的
        // 理想情況下：MusicPlayer 應該儲存 { url, title } 物件，而不只是 url string
        for (const [index, songUrl] of playlist.entries()) {
            if (index >= MAX_DISPLAY) {
                fields.push({
                    name: '⚠️ ...and more',
                    value: `Total ${playlist.length} songs.`,
                    inline: false
                });
                break;
            }

            try {
                // 嘗試獲取標題
                const info = await ytdl.getBasicInfo(songUrl);
                const title = info.videoDetails.title;

                fields.push({
                    name: `${index + 1}. ${title}`,
                    value: `[Link](${songUrl})`,
                    inline: false
                });

                if (index === 0) {
                    embed.setThumbnail(info.videoDetails.thumbnails[0]?.url || '');
                }
            } catch (error) {
                fields.push({
                    name: `${index + 1}. Unknown Title`,
                    value: `[Link](${songUrl})`,
                    inline: false
                });
                logger.warn(`Failed to fetch info for playlist item ${songUrl}`);
            }
        }

        embed.addFields(fields);
        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to display playlist.');
    }
}
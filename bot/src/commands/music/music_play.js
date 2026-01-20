import { SlashCommandBuilder } from 'discord.js';
import MusicPlayer from '../../features/music/MusicPlayer.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('music_play')
    .setDescription('Play the first song in the playlist');

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const userTag = interaction.user.tag;
        const member = interaction.member;

        logger.info(`Cmd /music_play by ${userTag} in ${guildId}`);

        // Check voice channel
        if (!member.voice.channel) {
            logger.warn(`User ${userTag} tried to play music without joining VC.`);
            return interaction.editReply('❌ Please join a voice channel first.');
        }

        const player = new MusicPlayer(guildId);
        const playlist = player.getPlaylist();

        if (playlist.length === 0) {
            return interaction.editReply('🎵 The playlist is currently empty. Please use `/music_add` first!');
        }

        logger.info(`Starting playback in ${guildId} for ${userTag}`);
        await player.playSong(interaction); // Logic delegated to MusicPlayer
        
    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Unable to play the song.');
    }
}
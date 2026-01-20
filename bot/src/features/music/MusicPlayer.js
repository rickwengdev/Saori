import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    getVoiceConnection,
    demuxProbe,
    AudioPlayerStatus 
} from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import { savePlaylists, playlists } from './playlistManager.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

class MusicPlayer {
    constructor(guildId) {
        this.guildId = guildId;
        this.player = createAudioPlayer();
        this.songUrl = null;

        this.initPlaylist();
        
        this.player.on('error', error => {
            logger.error(`AudioPlayer error in guild ${this.guildId}: ${error.message}`);
        });

        logger.info(`MusicPlayer initialized for guild: ${guildId}`);
    }

    initPlaylist() {
        if (!playlists.has(this.guildId)) {
            playlists.set(this.guildId, []);
        }
    }

    addSong(songUrl) {
        const playlist = playlists.get(this.guildId) || [];
        playlist.push(songUrl);
        playlists.set(this.guildId, playlist);
        savePlaylists();
        logger.info(`Song added to playlist for guild: ${this.guildId}`);
    }

    getPlaylist() {
        return playlists.get(this.guildId) || [];
    }

    removeSong(songUrl) {
        const playlist = playlists.get(this.guildId) || [];
        const updatedPlaylist = playlist.filter(url => url !== songUrl);
        playlists.set(this.guildId, updatedPlaylist);
        savePlaylists();
    }
    
    removeCurrentSong() {
        if (this.songUrl) {
            const playlist = playlists.get(this.guildId) || [];
            playlists.set(this.guildId, playlist.filter(url => url !== this.songUrl));
            savePlaylists();
        }
    }

    async createAudioResource(songUrl) {
        try {
            const stream = ytdl(songUrl, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            const { stream: probeStream, type } = await demuxProbe(stream);
            return createAudioResource(probeStream, { inputType: type });
        } catch (error) {
            throw new Error(`Failed to create audio resource: ${error.message}`);
        }
    }

    async playSong(interaction) {
        const voiceChannelId = interaction.member?.voice.channelId;
        if (!voiceChannelId) {
            await interaction.editReply('❌ Please join a voice channel first!');
            return;
        }

        this.songUrl = this.getPlaylist()[0];
        if (!this.songUrl) {
            await interaction.editReply('❌ The playlist is empty, please add a song!');
            return;
        }

        try {
            const videoInfo = await ytdl.getBasicInfo(this.songUrl);
            const rawDescription = videoInfo?.videoDetails?.description;
            const saveDescription = typeof rawDescription === 'string' ? rawDescription.slice(0, 200) + '...' : 'No description available.';

            const embed = new EmbedBuilder()
                .setTitle(videoInfo.videoDetails.title)
                .setThumbnail(videoInfo.videoDetails.thumbnails[0]?.url || '')
                .setDescription(saveDescription)
                .setColor('#FF0000');

            await interaction.editReply({ content: '🎵 Now playing:', embeds: [embed] });
            
            logger.info(`Playing song in guild: ${this.guildId}, URL: ${this.songUrl}`);

            let connection = getVoiceConnection(interaction.guild.id);
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                connection.subscribe(this.player);
            }

            const resource = await this.createAudioResource(this.songUrl);
            this.player.play(resource);

            this.player.once(AudioPlayerStatus.Idle, () => this.handleNextSong(interaction));

        } catch (error) {
            await ErrorHandler.handle(error, interaction, 'Unable to play the song. Please try again.');
        }
    }

    async handleNextSong(interaction) {
        this.removeCurrentSong();
        this.songUrl = this.getPlaylist()[0];

        if (this.songUrl) {
            await this.playSong(interaction);
        } else {
            const connection = getVoiceConnection(interaction.guild.id);
            if (connection) connection.destroy();
            logger.info(`Music playback stopped for guild: ${this.guildId}`);
        }
    }

    stop(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
        }
        this.removeCurrentSong();
        this.songUrl = null;
        this.player.stop(true);
        logger.info(`Playback stopped by user in guild: ${this.guildId}`);
    }
}

export default MusicPlayer;
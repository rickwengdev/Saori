import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync } from 'fs'; // 混合引入
import ytdl from '@distube/ytdl-core';
import path from 'path';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

const downloadPath = path.resolve('./downloads');

// Ensure download directory exists (同步執行即可)
if (!existsSync(downloadPath)) {
    mkdirSync(downloadPath);
}

/**
 * Download YouTube audio as MP3
 */
async function downloadMp3(url, filename) {
    const filePath = path.join(downloadPath, filename);
    logger.info(`Starting download: ${url} -> ${filePath}`);

    return new Promise((resolve, reject) => {
        const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        const writeStream = createWriteStream(filePath);

        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            logger.info(`Download completed: ${filePath}`);
            resolve(filePath);
        });

        writeStream.on('error', (error) => {
            reject(error);
        });
        
        audioStream.on('error', (error) => {
            reject(error);
        });
    });
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

export const data = new SlashCommandBuilder()
    .setName('download_video')
    .setDescription('Download MP3 audio from a YouTube video')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('URL of the YouTube video')
            .setRequired(true));

export async function execute(interaction) {
    let mp3Path = null;
    try {
        await interaction.deferReply();
        const videoUrl = interaction.options.getString('url');
        
        logger.info(`Cmd /download_video by ${interaction.user.tag} URL: ${videoUrl}`);

        // Fetch Info
        const info = await ytdl.getBasicInfo(videoUrl);
        const details = info.videoDetails;
        
        // Sanitize filename
        const safeTitle = details.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const filename = `${safeTitle}.mp3`;

        // Download
        mp3Path = await downloadMp3(videoUrl, filename);

        // Check size (Discord Limit: 8MB for non-nitro bots usually, safe limit)
        const stats = await fs.stat(mp3Path);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > 8) {
            await fs.unlink(mp3Path); // Delete immediately
            logger.warn(`File too large (${fileSizeInMB.toFixed(2)} MB), deleted.`);
            return interaction.editReply(`❌ File is too large (${fileSizeInMB.toFixed(2)} MB) to upload to Discord.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(details.title)
            .setURL(details.video_url)
            .setDescription(`**Author**: ${details.author.name}\n**Duration**: ${formatDuration(details.lengthSeconds)}`)
            .setThumbnail(details.thumbnails[0]?.url)
            .setFooter({ text: 'Enjoy your music!' });

        await interaction.editReply({
            embeds: [embed],
            files: [mp3Path],
        });

        logger.info(`Uploaded MP3: ${filename}`);

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to download/upload video.');
    } finally {
        // Clean up: Always delete the file if it exists
        if (mp3Path) {
            try {
                await fs.unlink(mp3Path);
                logger.debug(`Deleted temp file: ${mp3Path}`);
            } catch (e) {
                // Ignore if file doesn't exist
            }
        }
    }
}
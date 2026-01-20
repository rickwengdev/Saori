import { SlashCommandBuilder } from 'discord.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('bot_test')
    .setDescription('Test the bot running status');

export async function execute(interaction) {
    try {
        const userTag = interaction.user.tag;
        const guildId = interaction.guild?.id || 'DM';

        logger.info(`Cmd /bot_test triggered by ${userTag} in ${guildId}`);

        await interaction.reply('✅ The bot is running and healthy!');

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to execute status check.');
    }
}
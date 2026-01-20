import { SlashCommandBuilder } from "discord.js";
import logger from "../../utils/Logger.js";
import ErrorHandler from "../../utils/ErrorHandler.js";

export const data = new SlashCommandBuilder()
    .setName('randomchar')
    .setDescription('Randomly returns a user-inputted word')
    .addStringOption((option) =>
        option
            .setName('input')
            .setDescription('Input string, separated by spaces')
            .setRequired(true)
    );

export async function execute(interaction) {
    try {
        const input = interaction.options.getString('input');
        const userTag = interaction.user.tag;
        const guildId = interaction.guild?.id || 'DM';

        logger.info(`Cmd /randomchar by ${userTag} in ${guildId} Input: "${input}"`);

        // Split the input string into an array of words
        const words = input.trim().split(/\s+/);

        if (words.length === 0 || (words.length === 1 && words[0] === '')) {
            logger.warn(`User ${userTag} provided empty input.`);
            await interaction.reply({ content: '❌ You did not provide any words.', ephemeral: true });
            return;
        }

        // Randomly select a word
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        logger.info(`Selected "${randomWord}" for ${userTag}`);

        await interaction.reply(randomWord);

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to pick a random character.');
    }
}
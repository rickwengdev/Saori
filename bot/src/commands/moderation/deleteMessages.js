import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import MessageDeleter from "../../features/moderation/messageDelete.js"; // 注意路徑修正
import logger from "../../utils/Logger.js";
import ErrorHandler from "../../utils/ErrorHandler.js";

export const data = new SlashCommandBuilder()
    .setName('mod_delete_message')
    .setDescription('Batch delete messages')
    .addIntegerOption(option =>
        option.setName('message_number')
            .setDescription('Number of messages to delete')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('reliable_vintage_model')
            .setDescription('Enable deletion for messages older than 2 weeks? (Slower)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
    try {
        const messageNumber = interaction.options.getInteger('message_number');
        const timeRangeBig = interaction.options.getBoolean('reliable_vintage_model') ?? true; // 預設 true

        logger.info(`Cmd /mod_delete_message by ${interaction.user.tag} Count: ${messageNumber}, VintageMode: ${timeRangeBig}`);

        // 初始化刪除器
        const deleter = new MessageDeleter(interaction);

        await deleter.handleInteraction(messageNumber, timeRangeBig);

    } catch (error) {
        await ErrorHandler.handle(error, interaction, 'Failed to delete messages.');
    }
}
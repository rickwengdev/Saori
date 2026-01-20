import { SlashCommandBuilder } from 'discord.js';
import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

export const data = new SlashCommandBuilder()
  .setName('bot_anonymousmessage')
  .setDescription('Send an anonymous message or endorsement')
  .addStringOption(option => 
    option.setName('message')
    .setDescription('The message to send anonymously')
    .setRequired(true))
  .addStringOption(option => 
    option.setName('messageid')
    .setDescription('Optional: The Message ID to reply to'));

export async function execute(interaction) {
  try {
    const message = interaction.options.getString('message');
    const messageId = interaction.options.getString('messageid');
    const userTag = interaction.user.tag;
    const guildId = interaction.guild?.id || 'DM';

    logger.info(`Cmd /bot_anonymousmessage by ${userTag} in ${guildId}`);

    // 先回覆使用者 (Ephemeral)，確認收到指令
    await interaction.reply({
        content: `✅ Anonymous message sent!`,
        ephemeral: true,
    });

    if (messageId) {
        // 嘗試回覆特定訊息
        try {
            await interaction.channel.send({
                content: message,
                reply: { messageReference: messageId },
            });
            logger.info(`Anon reply sent to msg ${messageId}`);
        } catch (replyError) {
            // 如果找不到訊息 ID，改為普通發送
            logger.warn(`Could not reply to message ID ${messageId}, sending as normal message. Error: ${replyError.message}`);
            await interaction.channel.send(message);
        }
    } else {
        // 普通發送
        await interaction.channel.send(message);
        logger.info(`Anon message sent in ${guildId}`);
    }

  } catch (error) {
    await ErrorHandler.handle(error, interaction, 'Failed to send anonymous message.');
  }
}
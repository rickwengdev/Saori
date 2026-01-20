// src/utils/ErrorHandler.js
import logger from './Logger.js';

class ErrorHandler {
  /**
   * 統一錯誤處理入口
   * @param {Error} error - 錯誤物件
   * @param {import('discord.js').Interaction} [interaction] - (可選) Discord 交互
   * @param {string} [customMessage] - (可選) 自定義回覆訊息
   */
  static async handle(error, interaction = null, customMessage = 'An unexpected error occurred.') {
    // 1. 記錄到系統日誌 (包含 Stack Trace)
    // 我們可以附加 metadata 來知道是哪個 Guild 發生的
    logger.error(error.message, { 
        stack: error.stack, 
        guildId: interaction?.guildId,
        user: interaction?.user?.tag
    });

    // 2. 如果有 Interaction，嘗試回覆使用者
    if (interaction) {
      try {
        const responseData = { 
          content: `❌ ${customMessage}`, 
          ephemeral: true 
        };

        // 判斷是否已經回覆過，避免 "Interaction already replied" 錯誤
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(responseData).catch(() => interaction.editReply(responseData));
        } else {
          await interaction.reply(responseData);
        }
      } catch (replyError) {
        // 如果連回覆都失敗 (例如沒有權限)，只記錄 Log，不讓程式崩潰
        logger.warn(`Failed to send error response to user: ${replyError.message}`);
      }
    }
  }
}

export default ErrorHandler;
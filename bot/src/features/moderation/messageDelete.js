import logger from '../../utils/Logger.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

/**
 * @class MessageDeleter
 * @description Provides functionality to delete messages from a Discord channel, including batch deletion.
 */
class MessageDeleter {
    /**
     * @constructor
     * @param {object} interaction - Discord interaction object.
     */
    constructor(interaction) {
        if (!interaction || !interaction.channel) {
            throw new Error('Invalid interaction or channel is not accessible');
        }
        this.interaction = interaction;
        this.channel = interaction.channel;
    }

    /**
     * @method deleteMessages
     * @description Deletes messages based on quantity and time range.
     * @param {number} numberOfMessages - Number of messages to delete (default: 1).
     * @param {boolean} isLargeTimeRange - Whether to delete messages from a larger time range (default: false).
     * @returns {Promise<number>} Number of messages deleted.
     */
    async deleteMessages(numberOfMessages = 1, isLargeTimeRange = false) {
        if (isLargeTimeRange || numberOfMessages > 100) {
            logger.info('🔄 Performing multiple batch deletes...');
            return this.bulkDeleteMessages(numberOfMessages);
        }
        return this.simpleDelete(numberOfMessages);
    }

    /**
     * @method simpleDelete
     * @description Deletes messages simply, without exceeding Discord limits (100 messages max).
     * @param {number} numberOfMessages - Number of messages to delete.
     * @returns {Promise<number>} Number of messages deleted.
     */
    async simpleDelete(numberOfMessages) {
        try {
            // Discord API restricts bulkDelete to messages within 14 days
            const deletedMessages = await this.channel.bulkDelete(numberOfMessages, true); 
            logger.info(`✅ Successfully deleted ${deletedMessages.size} messages.`);
            return deletedMessages.size;
        } catch (error) {
            logger.error('❌ Error in simple delete:', error);
            return 0;
        }
    }

    /**
     * @method bulkDeleteMessages
     * @description Deletes messages in batches, with a maximum of 100 per batch.
     * @param {number} numberOfMessages - Number of messages to delete.
     * @returns {Promise<number>} Number of messages deleted.
     */
    async bulkDeleteMessages(numberOfMessages) {
        let remainingMessages = numberOfMessages;
        const batchSize = 100;
        const delayBetweenBatches = 1000; // 稍微增加延遲以避免 Rate Limit

        try {
            while (remainingMessages > 0) {
                const messagesToDelete = Math.min(remainingMessages, batchSize);
                
                // Fetch messages
                const fetchedMessages = await this.channel.messages.fetch({ limit: messagesToDelete });
                if (fetchedMessages.size === 0) break;

                logger.info(`🗑️ Deleting ${fetchedMessages.size} messages in batch...`);
                
                // 嘗試批量刪除，如果失敗則逐條刪除 (針對超過 14 天的訊息)
                try {
                    await this.channel.bulkDelete(fetchedMessages, true);
                } catch (bulkError) {
                    logger.warn('Bulk delete failed (likely old messages), switching to manual delete...');
                    await Promise.allSettled(fetchedMessages.map(msg => msg.delete()));
                }

                remainingMessages -= fetchedMessages.size;

                if (remainingMessages > 0) {
                    logger.info(`⏳ Waiting for ${delayBetweenBatches}ms before next batch...`);
                    await this.delay(delayBetweenBatches);
                }
            }
            return numberOfMessages - remainingMessages;
        } catch (error) {
            logger.error('❌ Error during batch deletion:', error);
            return numberOfMessages - remainingMessages;
        }
    }

    /**
     * @method handleInteraction
     * @description Handles message deletion interaction logic.
     * @param {number} numberOfMessages - Number of messages to delete.
     * @param {boolean} isLargeTimeRange - Whether to delete messages from a larger time range.
     * @returns {Promise<void>}
     */
    async handleInteraction(numberOfMessages = 1, isLargeTimeRange = false) {
        try {
            // 確保尚未回覆才執行 defer
            if (!this.interaction.deferred && !this.interaction.replied) {
                await this.interaction.deferReply({ ephemeral: true });
            }

            logger.info(`Starting to delete ${numberOfMessages} messages (Large time range: ${isLargeTimeRange})`);

            const deletedCount = await this.deleteMessages(numberOfMessages, isLargeTimeRange);
            
            const replyMessage = deletedCount > 0
                ? `✅ Successfully deleted ${deletedCount} messages.`
                : '⚠️ No messages were deleted (Check permissions or message age).';

            logger.info(replyMessage);
            await this.interaction.editReply({ content: replyMessage });

        } catch (error) {
            await ErrorHandler.handle(error, this.interaction, 'Failed to delete messages.');
        }
    }

    /**
     * @method delay
     * @description Adds delay, useful for batch operations.
     * @param {number} ms - Number of milliseconds to delay.
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default MessageDeleter;
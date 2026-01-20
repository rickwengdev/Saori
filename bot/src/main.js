import { readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// 1. 引入核心工具 (單例模式)
import logger from './utils/Logger.js';
import ErrorHandler from './utils/ErrorHandler.js';

// 2. 引入功能模組
// 建議確認路徑是否正確，並將 logservermessage 改名為 GuildLogService 以符合命名規範
import MessageReactionHandler from './features/moderation/messageReaction.js';
import DynamicVoiceChannelManager from './features/moderation/dynamicVoiceChannel.js';
import GuildLogService from './features/moderation/GuildLogService.js'; // 建議改檔名
import GuildMembers from './features/moderation/guildMember.js';
import TrackingMembersNumber from './features/moderation/trackingMembersNumber.js';

// 初始化環境變數
dotenv.config();

// 3. 全局崩潰處理 (移到最上方，確保能捕捉啟動期錯誤)
process.on('uncaughtException', (error) => {
    logger.error('🔥 Uncaught Exception! The bot is crashing...', error);
    // 根據需求決定是否退出，通常 PM2 會自動重啟
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('⚠️ Unhandled Rejection at Promise:', { reason, promise });
});

// 初始化 Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 4. 非同步加載指令 (優化版)
 * 使用 async/await 確保指令完全載入後才繼續
 */
async function loadCommands() {
    const foldersPath = path.join(__dirname, 'commands');
    
    // 檢查目錄是否存在
    try {
        const commandFolders = readdirSync(foldersPath).filter(folder => {
            const folderPath = path.join(foldersPath, folder);
            return statSync(folderPath).isDirectory();
        });

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                try {
                    // 動態導入
                    const commandModule = await import(filePath);
                    const command = commandModule.default || commandModule; // 兼容 export default

                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        logger.info(`📝 Command loaded: ${command.data.name}`);
                    } else {
                        logger.warn(`[WARNING] The command in ${filePath} is missing a required "data" or "execute" attribute.`);
                    }
                } catch (error) {
                    logger.error(`❌ Failed to load command ${filePath}:`, error);
                }
            }
        }
    } catch (err) {
        logger.error('❌ Error reading commands directory:', err);
    }
}

// 監聽指令交互
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`User ${interaction.user.tag} tried to run unknown command: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        // 5. 使用統一的 ErrorHandler
        await ErrorHandler.handle(error, interaction, 'There was an error while executing this command!');
    }
});

// Bot 準備就緒
client.once(Events.ClientReady, async (c) => {
    logger.info(`✅ Ready! Signed in as ${c.user.tag}`);

    client.user.setPresence({ activities: [{ name: 'DISCORD.JS' }], status: 'dnd' });

    // 初始化功能模組
    setupFeatures();
});

/**
 * 初始化各個功能模組
 */
function setupFeatures() {
    const apiEndpoint = process.env.apiEndpoint;
    
    if (!apiEndpoint) {
        logger.warn('⚠️ apiEndpoint is missing in .env! Some features might fail.');
    }

    try {
        new MessageReactionHandler(client, apiEndpoint);
        new GuildMembers(client, apiEndpoint);
        new DynamicVoiceChannelManager(client, apiEndpoint);
        new TrackingMembersNumber(client, apiEndpoint);
        new GuildLogService(client, apiEndpoint); // 這裡改用新名稱

        logger.info('🚀 All feature managers initialized successfully.');
    } catch (error) {
        logger.error('❌ Error during feature setup:', error);
    }
}

// 6. 啟動流程
(async () => {
    await loadCommands(); // 先載入指令
    
    // 再登入
    client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
        logger.error('❌ Failed to login to Discord:', error);
    });
})();
import api from '../../services/api.js';
import logger from '../../utils/Logger.js';

class MessageReactionHandler {
    constructor(client) {
        this.client = client;
        this.client.on('messageReactionAdd', this.handleReactionAdd.bind(this));
        this.client.on('messageReactionRemove', this.handleReactionRemove.bind(this));
    }

    async handleReactionAdd(reaction, user) {
        if (user.bot) return;

        try {
            if (reaction.partial) await reaction.fetch();
            if (user.partial) await user.fetch();
            if (!reaction.message.guild) return;

            const { role, member } = await this.getRoleAndMember(reaction, user);
            if (member && role) {
                await member.roles.add(role);
                logger.info(`Added role ${role.name} to ${user.tag} in guild ${reaction.message.guild.id}`);
            }
        } catch (error) {
            logger.error(`Error handling reaction add in guild ${reaction.message.guild?.id}:`, error);
        }
    }

    async handleReactionRemove(reaction, user) {
        if (user.bot) return;

        try {
            if (reaction.partial) await reaction.fetch();
            if (user.partial) await user.fetch();
            if (!reaction.message.guild) return;

            const { role, member } = await this.getRoleAndMember(reaction, user);
            if (member && role) {
                await member.roles.remove(role);
                logger.info(`Removed role ${role.name} from ${user.tag} in guild ${reaction.message.guild.id}`);
            }
        } catch (error) {
            logger.error(`Error handling reaction remove in guild ${reaction.message.guild?.id}:`, error);
        }
    }

    async getRoleAndMember(reaction, user) {
        const guild = reaction.message.guild;
        const guildId = guild.id;
        const messageId = reaction.message.id;
        const emojiKey = reaction.emoji.id || reaction.emoji.name;

        try {
            const response = await api.get(`/api/${guildId}/reaction-roles`);
            
            if (!response.success || !response.data) return { role: null, member: null };

            const reactionRolesArray = response.data;
            // 尋找匹配的設定
            const reactionData = reactionRolesArray.find(
                item => item.message_id === messageId && item.emoji === emojiKey
            );

            if (!reactionData) return { role: null, member: null };

            const roleId = reactionData.role_id; // 注意：後端回傳的是 role_id
            const member = await guild.members.fetch(user.id).catch(() => null);
            const role = await guild.roles.fetch(roleId).catch(() => null);

            return { role, member };
        } catch (error) {
            return { role: null, member: null };
        }
    }
}

export default MessageReactionHandler;
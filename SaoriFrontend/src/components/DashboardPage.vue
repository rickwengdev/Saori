<template>
  <div class="container">
    <NavigationBar />
    <main class="main-content">
      <h2>Dashboard</h2>
      <p v-if="loading" class="loading-message">Loading your servers...</p>
      <ul v-if="servers" class="server-list">
        <li v-for="server in servers" :key="server.id" class="server-item">
          <div class="server-info">
            <!-- 如果伺服器有自定義圖標，則顯示自定義圖標；否則顯示默認 Clyde 圖標 -->
            <img
              :src="server.iconUrl || 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg'"
              alt="Server Icon"
              class="server-icon"
            />
            <span class="server-name">{{ server.name }}</span>
          </div>
          <div class="button-group">
            <button
              v-if="server.isBotInServer"
              @click="configureBot(server)"
              class="configure-button"
            >
              Configure
            </button>
            <button
              v-else
              @click="inviteBot(server.id)"
              class="invite-button"
            >
              Invite
            </button>
          </div>
        </li>
      </ul>
      <p v-if="error" class="error-message">{{ error }}</p>
    </main>
  </div>
</template>

<script>
import apiService from '@/services/apiService';
import NavigationBar from '@/components/NavigationBar.vue';
const APIURL = import.meta.env.VITE_APP_BASE_URL;
const ClientId = import.meta.env.VITE_APP_ClientId;


export default {
  components: { NavigationBar },
  data() {
    return {
      servers: null,
      loading: true,
      error: null,
    };
  },
  async created() {
    try {
      const response = await apiService.get(`/user/guilds`);
      const serversWithBotStatus = await Promise.all(
        response.data.map(async (server) => {
          const botCheckResponse = await apiService.get(`/bot/${server.id}/checkBot`);
          const iconUrl = server.icon
            ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`
            : 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg';
          return { ...server, isBotInServer: botCheckResponse.isBotInServer, iconUrl };
        })
      );
      this.servers = serversWithBotStatus;
    } catch (error) {
      this.error = 'Failed to load servers';
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async configureBot(server) {
      const ServerId = server.id;
      const ServerName = server.name;
      try {
        // 獲取伺服器信息
        const serverinfo = await apiService.post(`/server/ensure`,{serverId: ServerId, serverName: ServerName});

        if (serverinfo && serverinfo.data && serverinfo.success) {
          // 如果伺服器存在，跳轉到 guildmember 頁面
          this.$router.push(`/${ServerId}/guildmember`);
        } else {
          // 如果返回數據無效，顯示錯誤消息
          this.error = serverinfo.data.message || 'Failed to load server info';
        }
      } catch (error) {
        // 捕獲請求錯誤並顯示友好提示
        console.error('Error configuring bot:', error);
        this.error = error.response?.data?.message || 'An unexpected error occurred';
      }
    },
    inviteBot(serverId) {
      const clientId = ClientId;
      const permissions = '8';
      const redirectUri = encodeURIComponent(`${APIURL}/auth/callback`);
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}&guild_id=${serverId}&response_type=code&redirect_uri=${redirectUri}`;
      window.location.href = inviteUrl;
    },
  },
};
</script>

<style scoped>
/* 通用樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

/* 容器 */
.container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #7289da, #4b2c5e);
  color: #ffffff;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.main-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}

.loading-message {
  font-size: 16px;
  color: #ffffff;
  text-align: center;
}

.server-list {
  list-style-type: none;
  padding: 0;
  margin: 0 auto;
  max-width: 800px;
}

/* 伺服器項目卡片 */
.server-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin: 10px 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.server-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.server-info {
  display: flex;
  align-items: center;
}

/* 圖標樣式 */
.server-icon {
  width: 50px; /* 設置圖片寬度 */
  height: 50px; /* 設置圖片高度 */
  border-radius: 50%; /* 圖像圓形化 */
  margin-right: 15px;
  object-fit: cover;
}

.server-name {
  font-size: 18px;
  color: #ffffff;
}

.button-group {
  display: flex;
  gap: 10px;
}

.configure-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #ffffff;
  background-color: #7289da;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.configure-button:hover {
  background-color: #5b6eae;
}

.invite-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #ffffff;
  background-color: #43b581;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.invite-button:hover {
  background-color: #318d64;
}

.error-message {
  color: #ff4757;
  font-size: 16px;
  margin-top: 20px;
  text-align: center;
}

.server-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.error-message {
  color: #ff4757;
  background-color: rgba(255, 71, 87, 0.1);
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 20px;
  text-align: center;
}
</style>
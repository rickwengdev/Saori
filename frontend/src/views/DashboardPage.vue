<template>
  <div>
    <n-h2>Select a Server</n-h2>
    <n-spin :show="loading">
      <n-grid x-gap="16" y-gap="16" cols="1 s:2 m:3 l:4" responsive="screen">
        <n-grid-item v-for="server in servers" :key="server.id">
          <n-card hoverable class="server-card">
            <div class="server-info">
              <n-avatar 
                :size="64" 
                :src="server.iconUrl" 
                fallback-src="https://cdn.discordapp.com/embed/avatars/0.png"
              />
              <n-text strong class="server-name">{{ server.name }}</n-text>
            </div>
            
            <template #action>
              <n-button 
                block 
                :type="server.isBotInServer ? 'primary' : 'success'"
                @click="handleServerClick(server)"
              >
                {{ server.isBotInServer ? 'Configure' : 'Invite Bot' }}
              </n-button>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>
      
      <n-empty v-if="!loading && servers.length === 0" description="No servers found" style="margin-top: 50px" />
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const loading = ref(true);
const servers = ref([]);
const API_URL = import.meta.env.VITE_APP_BASE_URL;
const CLIENT_ID = import.meta.env.VITE_APP_ClientId;

onMounted(async () => {
  console.log("🚀 Dashboard 載入中...");
  try {
    const res = await api.get('/user/guilds');
    console.log("✅ 後端原始回應:", res); 

    // 🔥 關鍵修正：自動判斷資料在哪一層
    // 如果 res 本身是陣列，就用 res
    // 如果 res 是物件且裡面有 data 屬性 (res.data)，就用 res.data
    const guildsList = Array.isArray(res) ? res : (res.data || []);

    if (!Array.isArray(guildsList)) {
      console.error("❌ 資料格式錯誤，預期是 Array，但收到:", guildsList);
      throw new Error("Invalid API response format");
    }

    const promises = guildsList.map(async (server) => {
       try {
         // 這裡也要注意，如果 checkBot 回傳也有包裝，要用 check.data 或 check
         const checkRes = await api.get(`/bot/${server.id}/checkBot`);
         const isBotInServer = checkRes.isBotInServer ?? checkRes.data?.isBotInServer ?? false;

         return { 
           ...server, 
           isBotInServer: isBotInServer, 
           iconUrl: server.icon 
             ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` 
             : null 
         };
       } catch (innerErr) {
         console.warn(`⚠️ 無法確認 Bot 狀態 (${server.name}):`, innerErr);
         return { ...server, isBotInServer: false, iconUrl: null };
       }
    });
    
    servers.value = await Promise.all(promises);
    
  } catch (e) {
    console.error("❌ Dashboard Error:", e);
    if (window.$message) {
        window.$message.error('無法載入伺服器列表');
    }
  } finally {
    loading.value = false;
  }
});

const handleServerClick = async (server) => {
  if (server.isBotInServer) {
     try {
       await api.post('/server/ensure', { serverId: server.id, serverName: server.name });
       router.push({ name: 'guildmember', params: { serverId: server.id } });
     } catch(e) {
       window.$message.error('設定失敗，請稍後再試');
     }
  } else {
     const redirectUri = encodeURIComponent(`${API_URL}/auth/callback`);
     const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot&permissions=8&guild_id=${server.id}&response_type=code&redirect_uri=${redirectUri}`;
     window.open(url, '_blank');
  }
};
</script>

<style scoped>
.server-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  margin-bottom: 12px;
}
.server-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
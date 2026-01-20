<template>
  <n-card title="Welcome & Leave Settings" :bordered="false">
    <n-spin :show="loading">
      <n-form ref="formRef" label-placement="top" class="setting-form">
        <n-grid :cols="1" :y-gap="24">
          <n-grid-item>
            <n-form-item label="Welcome Channel">
              <n-select
                v-model:value="config.welcomeChannelId"
                :options="channelOptions"
                placeholder="Select channel"
                clearable
              />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="Leave Channel">
              <n-select
                v-model:value="config.leaveChannelId"
                :options="channelOptions"
                placeholder="Select channel"
                clearable
              />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-button type="primary" @click="save" :loading="saving">Save Changes</n-button>
          </n-grid-item>
        </n-grid>
      </n-form>
      
      <n-divider />
      
      <n-alert title="Preview" type="info">
        Welcome: {{ getChannelName(config.welcomeChannelId) }} <br/>
        Leave: {{ getChannelName(config.leaveChannelId) }}
      </n-alert>
    </n-spin>
  </n-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const serverId = route.params.serverId;
const loading = ref(true);
const saving = ref(false);
const channels = ref([]);
const config = ref({ welcomeChannelId: null, leaveChannelId: null });

const channelOptions = computed(() => 
  channels.value.map(c => ({ label: `#${c.name}`, value: c.id }))
);

const getChannelName = (id) => {
  const ch = channels.value.find(c => c.id === id);
  return ch ? `#${ch.name}` : 'Not Set';
};

onMounted(async () => {
  loading.value = true;
  
  // 1. 先抓頻道 (這是最重要的，不能失敗)
  try {
    console.log('🚀 開始抓取頻道...');
    const chRes = await api.get(`/channel/${serverId}/channels`);
    
    // 🔥 在這裡直接印出來看後端給什麼
    console.log('📡 後端回傳的原始頻道資料:', chRes); 
    
    // 檢查資料結構 (有的後端會包在 data 裡，有的直接回傳陣列)
    const rawChannels = chRes.channels || chRes.data || chRes || [];

    // 過濾邏輯 (使用 == 來放寬 0 和 "0" 的檢查)
    channels.value = rawChannels.filter(c => c.type == 0);
    
    console.log('✅ 過濾後的 Text Channels:', channels.value);

  } catch (err) {
    console.error('❌ 抓取頻道失敗:', err);
  }

  // 2. 再抓設定檔 (允許失敗，獨立一個 try-catch)
  try {
    const confRes = await api.get(`/welcome-leave/${serverId}/getWelcomeLeave`);
    config.value.welcomeChannelId = confRes.config?.welcome_channel_id || null;
    config.value.leaveChannelId = confRes.config?.leave_channel_id || null;
  } catch (err) {
    // 這裡我們預期可能會 404，所以用 warn 就好，不要讓程式崩潰
    console.warn('⚠️ 設定檔未找到 (可能是第一次設定):', err.message);
  } finally {
    loading.value = false;
  }
});

const save = async () => {
  saving.value = true;
  try {
    await api.post(`/welcome-leave/${serverId}/updateWelcomeLeave`, config.value);
    window.$message.success('Settings Saved!');
  } catch(e) {
    window.$message.error('Save failed');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.setting-form { max-width: 600px; }
</style>
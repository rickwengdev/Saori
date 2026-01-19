<template>
  <n-card title="Member Count Tracking" :bordered="false">
    <n-spin :show="loading">
       <n-form>
          <n-form-item label="Tracking Channel (Renamed dynamically)">
             <n-select 
               v-model:value="config.trackingChannelId" 
               :options="channelOptions" 
             />
          </n-form-item>
          <n-button type="primary" @click="save" :loading="saving">Save</n-button>
       </n-form>
       <n-divider />
       <n-text depth="3">此頻道的名稱將會被自動修改為：Members: [Count]</n-text>
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
const config = ref({ trackingChannelId: null });

const channelOptions = computed(() => 
  channels.value.map(c => ({ label: `🔊 ${c.name}`, value: c.id }))
);

onMounted(async () => {
  try {
    const [chRes, confRes] = await Promise.all([
       api.get(`/channel/${serverId}/channels`),
       api.get(`/tracking/${serverId}/trackingMembers`)
    ]);
    // 通常 Tracking Channel 是語音頻道 (Type 2)，這樣才不會被洗版，視你後端邏輯而定
    // 這裡保留你原本代碼的邏輯 (Type 2)
    channels.value = (chRes.channels || []).filter(c => c.type === 2);
    config.value.trackingChannelId = confRes.config?.trackingmembers_channel_id || null;
  } finally {
    loading.value = false;
  }
});

const save = async () => {
  saving.value = true;
  try {
    await api.post(`/tracking/${serverId}/trackingMembers`, config.value);
    window.$message.success('Saved');
  } catch(e) {
    window.$message.error('Error');
  } finally {
    saving.value = false;
  }
};
</script>
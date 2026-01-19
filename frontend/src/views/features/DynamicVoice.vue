<template>
  <n-card title="Dynamic Voice Channel" :bordered="false">
    <n-spin :show="loading">
      <n-form class="setting-form">
         <n-form-item label="Base Voice Channel (Generator)">
             <n-select 
                v-model:value="config.baseChannelId" 
                :options="voiceOptions" 
                placeholder="Select a voice channel"
             />
         </n-form-item>
         <n-button type="primary" @click="save" :loading="saving">Save</n-button>
      </n-form>
      <n-divider />
      <n-text depth="3">當用戶進入此頻道時，機器人會自動創建一個新的臨時語音頻道。</n-text>
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
const config = ref({ baseChannelId: null });

const voiceOptions = computed(() => 
  channels.value.map(c => ({ label: `🔊 ${c.name}`, value: c.id }))
);

onMounted(async () => {
   try {
     const [chRes, confRes] = await Promise.all([
        api.get(`/channel/${serverId}/channels`),
        api.get(`/dynamic/${serverId}/dynamic-voice-channels`)
     ]);
     channels.value = (chRes.channels || []).filter(c => c.type === 2); // Type 2 = Voice
     config.value.baseChannelId = confRes.config?.base_channel_id || null;
   } finally {
     loading.value = false;
   }
});

const save = async () => {
   saving.value = true;
   try {
     await api.post(`/dynamic/${serverId}/dynamic-voice-channels`, config.value);
     window.$message.success('Saved');
   } catch(e) {
     window.$message.error('Error');
   } finally {
     saving.value = false;
   }
};
</script>
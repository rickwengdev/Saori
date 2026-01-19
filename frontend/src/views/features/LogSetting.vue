<template>
  <n-card title="Log Channel Settings" :bordered="false">
     <n-spin :show="loading">
        <n-form>
           <n-form-item label="Log Output Channel">
              <n-select 
                 v-model:value="config.logChannelId" 
                 :options="channelOptions" 
              />
           </n-form-item>
           <n-button type="primary" @click="save" :loading="saving">Save</n-button>
        </n-form>
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
const config = ref({ logChannelId: null });

const channelOptions = computed(() => 
  channels.value.map(c => ({ label: `#${c.name}`, value: c.id }))
);

onMounted(async () => {
  try {
    const [chRes, confRes] = await Promise.all([
       api.get(`/channel/${serverId}/channels`),
       api.get(`/log/${serverId}/log-channel`)
    ]);
    channels.value = (chRes.channels || []).filter(c => c.type === 0);
    config.value.logChannelId = confRes.config?.log_channel_id || null;
  } finally {
    loading.value = false;
  }
});

const save = async () => {
   saving.value = true;
   try {
     await api.post(`/log/${serverId}/log-channel`, config.value);
     window.$message.success('Saved');
   } catch(e) {
     window.$message.error('Error');
   } finally {
     saving.value = false;
   }
};
</script>
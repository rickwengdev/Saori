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

onMounted(async () => {
  try {
    const [chRes, confRes] = await Promise.all([
      api.get(`/channel/${serverId}/channels`),
      api.get(`/welcome-leave/${serverId}/getWelcomeLeave`)
    ]);

    channels.value = (chRes.channels || []).filter(c => c.type === 0);
    config.value.welcomeChannelId = confRes.config?.welcome_channel_id || null;
    config.value.leaveChannelId = confRes.config?.leave_channel_id || null;
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
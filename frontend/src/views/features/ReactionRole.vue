<template>
  <n-space vertical size="large">
    <n-card title="Reaction Role Configuration">
       <template #header-extra>
          <n-button type="primary" @click="showModal = true">Add New</n-button>
       </template>
       
       <n-data-table 
         :columns="columns" 
         :data="reactionRoles" 
         :loading="loading" 
       />
    </n-card>

    <n-modal v-model:show="showModal">
      <n-card style="width: 600px" title="Add Reaction Role" :bordered="false" size="huge">
         <n-form label-placement="left" label-width="100">
            <n-form-item label="Channel">
               <n-select v-model:value="form.channelId" :options="channelOptions" />
            </n-form-item>
            <n-form-item label="Message ID">
               <n-input v-model:value="form.messageId" placeholder="Discord Message ID" />
            </n-form-item>
            <n-form-item label="Emoji">
               <n-select v-model:value="form.emoji" :options="emojiOptions" filterable />
            </n-form-item>
            <n-form-item label="Role">
               <n-select v-model:value="form.roleId" :options="roleOptions" filterable />
            </n-form-item>
         </n-form>
         <template #footer>
            <n-space justify="end">
               <n-button @click="showModal = false">Cancel</n-button>
               <n-button type="primary" @click="save" :loading="saving">Save</n-button>
            </n-space>
         </template>
      </n-card>
    </n-modal>
  </n-space>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NAvatar } from 'naive-ui';
import api from '@/services/api';

const route = useRoute();
const serverId = route.params.serverId;
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);

const channels = ref([]);
const roles = ref([]);
const emojis = ref([]);
const reactionRoles = ref([]);

const form = ref({ channelId: null, messageId: '', emoji: null, roleId: null });

// 表格定義
const columns = [
  { title: 'Channel', key: 'channelName' },
  { title: 'Message ID', key: 'message_id' },
  { 
    title: 'Emoji', 
    key: 'emoji',
    render(row) {
       // 判斷是否為自定義圖片 Emoji
       const emojiObj = emojis.value.find(e => e.id === row.emoji || e.name === row.emoji);
       if (emojiObj && emojiObj.url) {
          return h(NAvatar, { src: emojiObj.url, size: 'small', color: 'transparent' });
       }
       return row.emoji; // 一般文字 Emoji
    }
  },
  { title: 'Role', key: 'roleName' },
  {
    title: 'Action',
    key: 'actions',
    render(row) {
      return h(NButton, {
        type: 'error',
        size: 'small',
        onClick: () => deleteItem(row)
      }, { default: () => 'Delete' });
    }
  }
];

const channelOptions = computed(() => channels.value.map(c => ({ label: `#${c.name}`, value: c.id })));
const roleOptions = computed(() => roles.value.map(r => ({ label: r.name, value: r.id })));
const emojiOptions = computed(() => emojis.value.map(e => ({ 
   label: e.name, 
   value: e.id || e.name, // 自定義用 ID, 標準用 Name
})));

const fetchData = async () => {
  loading.value = true;
  try {
    const [chRes, roleRes, emojiRes, listRes] = await Promise.all([
       api.get(`/channel/${serverId}/channels`),
       api.get(`/reaction-role/${serverId}/roles`),
       api.get(`/reaction-role/${serverId}/emojis`),
       api.get(`/api/${serverId}/reaction-roles`) // 你的 Preview API
    ]);
    
    channels.value = (chRes.channels || []).filter(c => c.type === 0);
    roles.value = roleRes.data || [];
    emojis.value = emojiRes.data || [];
    
    // 整理表格資料
    reactionRoles.value = (listRes.data || []).map(item => ({
       ...item,
       channelName: channels.value.find(c => c.id === item.channel_id)?.name || item.channel_id,
       roleName: roles.value.find(r => r.id === item.role_id)?.name || item.role_id
    }));
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const save = async () => {
   saving.value = true;
   try {
     await api.post(`/reaction-role/${serverId}/reaction-roles`, form.value);
     window.$message.success('Added!');
     showModal.value = false;
     await fetchData();
   } catch(e) {
     window.$message.error('Failed');
   } finally {
     saving.value = false;
   }
};

const deleteItem = async (row) => {
   try {
      await api.delete(`/reaction-role/${serverId}/reaction-roles`, {
         data: { messageId: row.message_id, emoji: row.emoji }
      });
      window.$message.success('Deleted');
      await fetchData();
   } catch(e) {
      window.$message.error('Delete failed');
   }
};
</script>
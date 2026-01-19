<template>
  <n-layout has-sider position="absolute">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="260"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="app-sider"
    >
      <div class="logo-area">
        <n-avatar 
            size="medium" 
            :src="botAvatar" 
            fallback-src="https://cdn.discordapp.com/embed/avatars/0.png"
        />
        <span v-if="!collapsed" class="logo-text">Saori Bot</span>
      </div>

      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="app-header">
        <div class="header-left">
             <n-breadcrumb>
                <n-breadcrumb-item>Dashboard</n-breadcrumb-item>
                <n-breadcrumb-item>{{ currentRouteTitle }}</n-breadcrumb-item>
             </n-breadcrumb>
        </div>
        <div class="header-right">
           <n-dropdown :options="userOptions" @select="handleUserSelect">
              <div class="user-trigger">
                 <n-avatar round size="small" :src="userStore.user?.avatarUrl" />
                 <span class="username">User</span>
              </div>
           </n-dropdown>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px; background: #101014;">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NIcon, NAvatar } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/services/api';
import { 
  ChatbubblesOutline, 
  HappyOutline, 
  MicOutline, 
  PeopleOutline, 
  SettingsOutline,
  LogOutOutline,
  GridOutline
} from '@vicons/ionicons5';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const botAvatar = ref(null);

const serverId = computed(() => route.params.serverId);

// Icon 渲染輔助
const renderIcon = (icon) => () => h(NIcon, null, { default: () => h(icon) });

// 選單設定
const menuOptions = computed(() => [
  {
    label: 'Server List',
    key: 'dashboard',
    icon: renderIcon(GridOutline),
  },
  {
    type: 'divider',
    key: 'd1',
    show: !!serverId.value // 只有選了伺服器才顯示分隔線
  },
  {
    label: 'Welcome & Leave',
    key: 'guildmember',
    icon: renderIcon(ChatbubblesOutline),
    disabled: !serverId.value
  },
  {
    label: 'Reaction Roles',
    key: 'reactionrole',
    icon: renderIcon(HappyOutline),
    disabled: !serverId.value
  },
  {
    label: 'Dynamic Voice',
    key: 'dynamicvoicechannel',
    icon: renderIcon(MicOutline),
    disabled: !serverId.value
  },
  {
    label: 'Member Tracking',
    key: 'trackingmembersnumber',
    icon: renderIcon(PeopleOutline),
    disabled: !serverId.value
  },
  {
    label: 'Logs',
    key: 'logchannel',
    icon: renderIcon(SettingsOutline),
    disabled: !serverId.value
  }
]);

const activeKey = computed(() => route.name);
const currentRouteTitle = computed(() => route.meta.title || 'Home');

const userOptions = [
  { label: 'Logout', key: 'logout', icon: renderIcon(LogOutOutline) }
];

onMounted(async () => {
  await userStore.checkAuth();
  try {
     const res = await api.get('/bot/bot-avatar');
     botAvatar.value = res.avatarUrl;
  } catch(e) {}
});

const handleMenuSelect = (key) => {
  if (key === 'dashboard') {
    router.push('/dashboard');
  } else if (serverId.value) {
    router.push({ name: key, params: { serverId: serverId.value } });
  } else {
    window.$message.warning('請先選擇一個伺服器');
  }
};

const handleUserSelect = (key) => {
  if (key === 'logout') userStore.logout();
};
</script>

<style scoped>
.logo-area {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0,0,0,0.2);
}
.logo-text {
  font-weight: bold;
  font-size: 16px;
}
.app-header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
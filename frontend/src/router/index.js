import { createRouter, createWebHistory } from 'vue-router';

// === Discord Dashboard 頁面 ===
import DashboardPage from '@/views/discord/DashboardPage.vue'; // 假設你的檔案在 src 根目錄或 views
import GuildMember from '@/views/discord/Guildmenber.vue'; // 注意檔名拼字 Guildmenber
import ReactionRole from '@/views/discord/ReactionRolePage.vue';
import DynamicVoice from '@/views/discord/DynamicVoiceChannelPage.vue';
import TrackingMembers from '@/views/discord/trackingMembersNumberPage.vue';
import LogChannel from '@/views/discord/LogChannelPage.vue';
import HomePage from '@/views/discord/HomePage.vue'; // 舊的首頁，可能改名為 AuthCallback 或其他用途

const routes = [
  // Discord Dashboard 主頁面
  {
    path: '/',
    name: 'Home',
    component: HomePage 
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  
  // 伺服器設定相關路由 (保留你原本的邏輯)
  {
    path: '/:serverId/guildmember',
    name: 'guildmember',
    component: GuildMember
  },
  {
    path: '/:serverId/reactionrole',
    name: 'reactionrole',
    component: ReactionRole
  },
  {
    path: '/:serverId/dynamicvoicechannel',
    name: 'dynamicvoicechannel',
    component: DynamicVoice
  },
  {
    path: '/:serverId/trackingmembersnumber',
    name: 'trackingmembersnumber',
    component: TrackingMembers
  },
  {
    path: '/:serverId/logchannel',
    name: 'logchannel',
    component: LogChannel
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
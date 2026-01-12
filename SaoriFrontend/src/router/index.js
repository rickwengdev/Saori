import { createRouter, createWebHistory } from 'vue-router';

// === 新的網站頁面 (Naive UI) ===
import WebHome from '@/views/web/Home.vue';
import WebBlog from '@/views/web/Blog.vue';
import WebProjects from '@/views/web/Projects.vue'; // 新增引用

// === Discord Dashboard 頁面 ===
import DashboardPage from '@/views/discord/DashboardPage.vue'; // 假設你的檔案在 src 根目錄或 views
import GuildMember from '@/views/discord/Guildmenber.vue'; // 注意檔名拼字 Guildmenber
import ReactionRole from '@/views/discord/ReactionRolePage.vue';
import DynamicVoice from '@/views/discord/DynamicVoiceChannelPage.vue';
import TrackingMembers from '@/views/discord/trackingMembersNumberPage.vue';
import LogChannel from '@/views/discord/LogChannelPage.vue';
import HomePage from '@/views/discord/HomePage.vue'; // 舊的首頁，可能改名為 AuthCallback 或其他用途

const routes = [
  // 1. 公共區域 (Public Zone)
  {
    path: '/',
    name: 'Home',
    component: WebHome
  },
  {
    path: '/blog',
    name: 'Blog',
    component: WebBlog
  },
  {
    path: '/projects',
    name: 'Projects',
    component: WebProjects
  },
  
  // 2. 儀表板區域 (Dashboard Zone) - 需要登入
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/discordhome', // 處理 Discord 登入回調
    name: 'DiscordHome',
    component: HomePage 
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
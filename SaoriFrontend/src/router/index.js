import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/HomePage.vue';
import Dashboard from '../components/DashboardPage.vue';
import GuildMember from '../components/Guildmenber.vue';
import LogChannelPage from '../components/LogChannelPage.vue';
import DynamicVoiceChannelPage from '../components/DynamicVoiceChannelPage.vue';
import ReactionRolePage from '../components/ReactionRolePage.vue';
import TrackingMembersNumberPage from '../components/trackingMembersNumberPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Home - My App',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard - My App',
    },
  },
  {
    path: '/:serverId/guildmember',
    name: 'guildmember',
    component: GuildMember,
    props: true,
    meta: {
      title: 'Guild Member - My App',
    },
  },
  {
    path: '/:serverId/logchannel',
    name: 'logchannel',
    component: LogChannelPage,
    props: true,
    meta: {
      title: 'Log Channel - My App',
    },
  },
  {
    path: '/:serverId/dynamicvoicechannel',
    name: 'dynamicvoicechannel',
    component: DynamicVoiceChannelPage,
    props: true,
    meta: {
      title: 'Dynamic Voice Channel - My App',
    },
  },
  {
    path: '/:serverId/reactionrole',
    name: 'reactionrole',
    component: ReactionRolePage,
    props: true,
    meta: {
      title: 'Reaction Role - My App',
    },
  },
  {
    path: '/:serverId/trackingmembersnumber',
    name: 'trackingmembersnumber',
    component: TrackingMembersNumberPage,
    props: true,
    meta: {
      title: 'Tracking Members Number - My App',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('../components/NotFoundPage.vue'), // 動態加載 404 頁面
    meta: {
      title: '404 - Page Not Found',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局導航守衛
router.beforeEach((to, from, next) => {
  // 設置頁面標題
  document.title = to.meta.title || 'My App';

  // 如果需要，可以加入權限驗證邏輯
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'home' });
  // } else {
  //   next();
  // }

  next();
});

export default router;
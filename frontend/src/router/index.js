import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user'; // 引入 Store
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import LoginCallback from '@/views/LoginCallback.vue';
import DashboardPage from '@/views/DashboardPage.vue';

// Lazy load features
const WelcomeSetting = () => import('@/views/features/WelcomeSetting.vue');
const ReactionRole = () => import('@/views/features/ReactionRole.vue');
const DynamicVoice = () => import('@/views/features/DynamicVoice.vue');
const Tracking = () => import('@/views/features/Tracking.vue');
const LogSetting = () => import('@/views/features/LogSetting.vue');

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginCallback
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
        meta: { title: 'Server List', requiresAuth: true }
      },
      {
        path: ':serverId/guildmember',
        name: 'guildmember',
        component: WelcomeSetting,
        meta: { title: 'Welcome Messages', requiresAuth: true }
      },
      {
        path: ':serverId/reactionrole',
        name: 'reactionrole',
        component: ReactionRole,
        meta: { title: 'Reaction Roles', requiresAuth: true }
      },
      {
        path: ':serverId/dynamicvoicechannel',
        name: 'dynamicvoicechannel',
        component: DynamicVoice,
        meta: { title: 'Dynamic Voice', requiresAuth: true }
      },
      {
        path: ':serverId/trackingmembersnumber',
        name: 'trackingmembersnumber',
        component: Tracking,
        meta: { title: 'Member Tracking', requiresAuth: true }
      },
      {
        path: ':serverId/logchannel',
        name: 'logchannel',
        component: LogSetting,
        meta: { title: 'Log Settings', requiresAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守衛修正：依賴 Store/API 檢查
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 1. 如果是去登入頁，直接放行
  if (to.name === 'login') {
    next();
    return;
  }

  // 2. 如果頁面需要驗證 (requiresAuth)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 先檢查 Store 裡是否已經標記為登入
    if (!userStore.isLoggedIn) {
      try {
        // 如果沒標記，呼叫後端 /auth/status 確認 Session 是否有效
        await userStore.checkAuth();
        
        if (userStore.isLoggedIn) {
          next(); // 後端說 OK (Cookie 有效)，放行
        } else {
          next('/'); // 後端說 NO，踢回首頁
        }
      } catch (error) {
        next('/'); // 請求失敗，踢回首頁
      }
    } else {
      next(); // Store 已經是登入狀態，直接放行
    }
  } else {
    next();
  }
});

export default router;
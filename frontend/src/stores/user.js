import { defineStore } from 'pinia';
import api from '@/services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false,
  }),
  actions: {
    async checkAuth() {
      if (this.isLoggedIn) return;
      this.loading = true;
      try {
        const status = await api.get('/auth/status');
        this.isLoggedIn = status.isLoggedIn;
        
        if (this.isLoggedIn) {
          const userData = await api.get('/auth/user-avatar');
          this.user = {
             avatarUrl: userData.avatarUrl,
             // 其他用戶資料可從後端擴充
          };
        }
      } catch (error) {
        this.isLoggedIn = false;
        this.user = null;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout');
      } finally {
        this.isLoggedIn = false;
        this.user = null;
        window.location.reload();
      }
    }
  }
});
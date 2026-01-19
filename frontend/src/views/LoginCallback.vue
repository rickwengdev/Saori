<template>
  <div class="login-container">
    <n-card class="login-card">
      <n-h2>Saori Dashboard</n-h2>
      <n-spin size="large" v-if="loading">
        <template #description>Verifying Session...</template>
      </n-spin>
      <n-button v-else type="primary" size="large" block @click="login">
        Login with Discord
      </n-button>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; // 引入我們剛改好的 api

const router = useRouter();
const loading = ref(false);
const API_URL = import.meta.env.VITE_APP_BASE_URL;

const login = () => {
  window.location.href = `${API_URL}/auth/discord`;
};

onMounted(async () => {
  // 1. 檢查網址是否有 token 參數 (例如 ?token=xyz)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    loading.value = true;
    
    // 🔥 關鍵修正：存入 Cookie 而不是 localStorage
    // 設定過期時間為 7 天 (或是你可以不設 expires 讓它變成 Session Cookie)
    document.cookie = `token=${token}; path=/; max-age=604800; Secure; SameSite=Lax`;

    // 存完後跳轉
    router.push('/dashboard');
  } else {
    // 2. 如果網址沒 token，檢查是否已經有登入狀態 (後端 Session)
    // 這是為了防止用戶按重新整理時被踢回登入頁
    try {
      loading.value = true;
      const res = await api.get('/auth/status'); // 呼叫後端確認狀態
      if (res.isLoggedIn) {
        router.push('/dashboard');
      } else {
        loading.value = false; // 留在登入頁
      }
    } catch (e) {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #101014 0%, #2c2c32 100%);
}
.login-card {
  width: 400px;
  text-align: center;
}
</style>
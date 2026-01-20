<template>
  <div class="debug-container">
    <n-card title="🕵️‍♂️ 登入狀態偵錯 (Debug Mode)">
      
      <div class="status-row">
        <n-tag type="info">API Base URL</n-tag>
        <code>{{ debugInfo.apiUrl }}</code>
        <n-text depth="3" v-if="debugInfo.apiUrl !== '/api'">
           ⚠️ 警告：這應該要是 '/api' 才能走 Firebase Rewrite
        </n-text>
      </div>

      <div class="status-row">
        <n-tag type="warning">瀏覽器現有 Cookie</n-tag>
        <code class="cookie-box">{{ debugInfo.cookie || '(無 Cookie)' }}</code>
      </div>

      <div class="status-row">
        <n-tag :type="debugInfo.apiStatus === 'success' ? 'success' : 'error'">
          API 連線測試 (/auth/status)
        </n-tag>
        <pre class="json-box">{{ debugInfo.apiResponse }}</pre>
      </div>

      <n-divider />

      <n-space vertical>
        <n-button type="primary" block @click="startLogin">
          1. 前往 Discord 登入 (重整流程)
        </n-button>
        <n-button secondary block @click="checkStatus">
          2. 手動檢查狀態
        </n-button>
        <n-button tertiary block @click="forceCleanup">
          清除所有快取與 Cookie
        </n-button>
      </n-space>

    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const debugInfo = reactive({
  apiUrl: API_URL,
  cookie: document.cookie,
  apiStatus: 'pending', // pending, success, error
  apiResponse: '等待檢測...',
});

const startLogin = () => {
  // 這裡應該要導向 /api/auth/discord
  // 如果 API_URL 是 /api，那最終網址就是 https://你的網域/api/auth/discord
  const target = `${API_URL}/auth/discord`;
  console.log('Redirecting to:', target);
  window.location.href = target;
};

const checkStatus = async () => {
  debugInfo.apiResponse = '載入中...';
  try {
    // 這裡我們直接看 api.get 的結果
    const res = await api.get('/auth/status');
    debugInfo.apiStatus = 'success';
    debugInfo.apiResponse = JSON.stringify(res, null, 2);
    
    // 如果後端回傳 success: true，代表 Cookie 成功送達後端了！
  } catch (err) {
    debugInfo.apiStatus = 'error';
    debugInfo.apiResponse = `Error: ${err.message}\n` + 
                            (err.response ? JSON.stringify(err.response.data, null, 2) : '');
  }
  // 更新 Cookie 顯示 (雖然 HttpOnly Cookie 看不到，但如果有其他 Cookie 可以參考)
  debugInfo.cookie = document.cookie;
};

const forceCleanup = () => {
  // 清除 Cookie (僅限非 HttpOnly)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  window.location.reload();
};

onMounted(() => {
  checkStatus();
});
</script>

<style scoped>
.debug-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background: #1a1a1a;
  min-height: 100vh;
}
.status-row {
  margin-bottom: 15px;
}
code {
  background: #333;
  padding: 2px 6px;
  border-radius: 4px;
  color: #a6e22e;
  word-break: break-all;
}
.cookie-box {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}
.json-box {
  background: #000;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
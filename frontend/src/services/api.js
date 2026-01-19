import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  withCredentials: true, // 關鍵：讓瀏覽器自動攜帶 Cookie
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 (這裡不需要做任何事了，Cookie 會自動帶)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 回應攔截器 (處理 401 未登入)
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    if (response) {
      // 如果後端回傳 401，代表 Cookie 失效或沒權限
      if (response.status === 401) {
        console.warn('Session expired (401), redirecting to login...');
        if (window.location.pathname !== '/' && !window.location.pathname.includes('/auth/callback')) {
           window.location.href = '/'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
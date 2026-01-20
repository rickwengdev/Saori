import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
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
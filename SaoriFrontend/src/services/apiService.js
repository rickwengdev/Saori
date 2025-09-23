import axios from "axios";

const APIURL = import.meta.env.VITE_APP_BASE_URL;

const apiService = {
    // 通用的 GET 請求
    async get(endpoint, params = {}) {
        try {
            const response = await axios.get(`${APIURL}${endpoint}`, {
                params,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },

    // 通用的 POST 請求
    async post(endpoint, data = {}) {
        try {
            const response = await axios.post(`${APIURL}${endpoint}`, data, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },

    // 通用的 DELETE 請求
    async delete(endpoint, data = {}) {
        try {
            const response = await axios.delete(`${APIURL}${endpoint}`, {
                data,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    },
};

export default apiService;
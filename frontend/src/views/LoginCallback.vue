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
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loading = ref(false);
const userStore = useUserStore();

const login = () => {
  window.location.href = `/api/auth/discord`;
};

onMounted(async () => {
  try {
    loading.value = true;
    await userStore.checkAuth();
    if (userStore.isLoggedIn) {
      router.push('/dashboard');
    } else {
      loading.value = false; // 留在登入頁
    }
  } catch (e) {
    loading.value = false;
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
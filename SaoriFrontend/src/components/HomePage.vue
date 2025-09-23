<template>
  <div class="container">
    <!-- 引入全局导航栏 -->
    <NavigationBar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <h2>Welcome to the Bot Configuration</h2>
      <p>Here you can configure your bot's settings and manage its features.</p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </main>
  </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue';

export default {
  components: {
    NavigationBar,
  },
  data() {
    return {
      error: null,
    };
  },
  async created() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      this.$router.push('/dashboard');
    }
  },
};
</script>

<style scoped>
/* 全局重置，移除所有预设边距和内距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

/* 主容器 */
.container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #7289da, #4b2c5e);
  color: #ffffff;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.main-content h2 {
  font-size: 28px;
  margin-bottom: 15px;
}

.main-content p {
  font-size: 16px;
  max-width: 600px;
  line-height: 1.6;
  color: #e0e0e0;
}

/* 错误信息 */
.error-message {
  color: #ff4757;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}
</style>
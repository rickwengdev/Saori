<template>
  <div class="landing-layout">
    <header class="navbar">
      <div class="nav-brand">
        <span class="logo-text">✨ Saori</span>
      </div>
      <div class="nav-actions">
        <n-spin size="small" v-if="loading" />
        <n-button v-else-if="!userStore.isLoggedIn" @click="login" type="primary" ghost round>
          Login
        </n-button>
        <n-button v-else @click="goToDashboard" type="primary" round>
          Go to Dashboard
        </n-button>
      </div>
    </header>

    <main class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Build the Best Discord Community</h1>
        <p class="hero-subtitle">
          Saori gives you everything you need to manage, entertain, and grow your server. 
          Leveling, moderation, music, and much more — all in one place.
        </p>
        <div class="hero-cta">
          <n-button type="primary" size="large" round class="cta-primary" @click="login">
            Add to Discord
          </n-button>
          <n-button size="large" round class="cta-secondary" @click="scrollToFeatures">
            See Features
          </n-button>
        </div>
      </div>
    </main>

    <section id="features" class="features-section">
      <h2 class="section-title">Everything you need to succeed</h2>
      
      <div class="features-grid">
        <n-card class="feature-card" hoverable>
          <div class="feature-icon">🏆</div>
          <h3>Leveling System</h3>
          <p>Reward your community for being active. Set up custom rank cards, XP rates, and automatic role rewards when members level up.</p>
        </n-card>

        <n-card class="feature-card" hoverable>
          <div class="feature-icon">🛡️</div>
          <h3>Advanced Moderation</h3>
          <p>Keep your server safe automatically. Batch delete messages, track user logs, and manage dynamic voice channels effortlessly.</p>
        </n-card>

        <n-card class="feature-card" hoverable>
          <div class="feature-icon">🎵</div>
          <h3>High-Quality Music</h3>
          <p>Enjoy your favorite tracks with friends. Support for playlists, volume control, and high-fidelity audio right in your voice channels.</p>
        </n-card>

        <n-card class="feature-card" hoverable>
          <div class="feature-icon">🎭</div>
          <h3>Anonymous Messages</h3>
          <p>Allow members to send anonymous feedback or endorsements safely. Foster a more open and honest community culture.</p>
        </n-card>
      </div>
    </section>

    <footer class="footer">
      <p>© 2026 Saori Project. Crafted with ❤️</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loading = ref(true);
const userStore = useUserStore();

// 讀取環境變數，預設為 '/api'
const API_URL = import.meta.env.VITE_APP_BASE_URL || '/api';

const login = () => {
  window.location.href = `${API_URL}/auth/discord`;
};

const goToDashboard = () => {
  router.push('/dashboard');
};

const scrollToFeatures = () => {
  const el = document.getElementById('features');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(async () => {
  try {
    // 進入首頁時檢查登入狀態，但不再強制跳轉，讓使用者可以看 Landing Page
    await userStore.checkAuth();
  } catch (e) {
    console.error('Session check failed:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 整體配置 */
.landing-layout {
  min-height: 100vh;
  background-color: #101014;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}

/* 導覽列 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 10%;
  background-color: rgba(16, 16, 20, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ff7a18, #af002d 50%, #319197);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 英雄區塊 */
.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8rem 20px;
  background: radial-gradient(circle at 50% 50%, rgba(49, 145, 151, 0.15), transparent 60%);
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #a0a0ab;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-primary {
  font-weight: bold;
  padding: 0 2rem;
}

.cta-secondary {
  background-color: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}
.cta-secondary:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* 功能區塊 */
.features-section {
  padding: 5rem 10%;
  background-color: #18181c;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #202025;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #a0a0ab;
  line-height: 1.6;
}

/* 頁尾 */
.footer {
  text-align: center;
  padding: 3rem;
  color: #666;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-cta {
    flex-direction: column;
  }
}
</style>
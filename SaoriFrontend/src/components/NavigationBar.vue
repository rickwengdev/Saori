<template>
  <header class="navbar">
    <div class="navbar-left">
      <img v-if="botAvatarUrl" :src="botAvatarUrl" alt="Discord Bot" class="logo" @click="goToHomepage" />
    </div>
    <div class="navbar-right">
      <div class="user-menu">
        <template v-if="isLoggedIn">
          <img
            :src="userAvatarUrl"
            alt="User Avatar"
            class="user-avatar"
            @click="toggleDropdown"
          />
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <a @click="goToDashboard">Dashboard</a>
            <a @click="logout">Logout</a>
          </div>
        </template>
        <template v-else>
          <button @click="login" class="login-button">Login</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import axios from 'axios';
const API_URL = import.meta.env.VITE_APP_BASE_URL;

export default {
  data() {
    return {
      botAvatarUrl: null,
      userAvatarUrl: null,
      isLoggedIn: false,
      isDropdownOpen: false,
    };
  },
  async created() {
    try {
      const statusResponse = await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
      this.isLoggedIn = statusResponse.data.isLoggedIn;

      if (this.isLoggedIn) {
        const userResponse = await axios.get(`${API_URL}/auth/user-avatar`, { withCredentials: true });
        this.userAvatarUrl = userResponse.data.avatarUrl;
      }
    } catch (error) {
      console.error('Failed to verify login status or fetch user data:', error);
      this.isLoggedIn = false;
    }

    try {
      const botResponse = await axios.get(`${API_URL}/bot/bot-avatar`);
      this.botAvatarUrl = botResponse.data.avatarUrl;
    } catch (error) {
      console.error('Failed to load bot avatar.', error);
    }
  },
  methods: {
    login() {
      window.location.href = `${API_URL}/auth/discord`;
    },
    async logout() {
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        this.isLoggedIn = false;
        this.isDropdownOpen = false;
        this.$router.push('/');
        window.location.reload();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    goToHomepage() {
      this.$router.push('/');
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    goToDashboard() {
      this.$router.push('/dashboard');
      this.isDropdownOpen = false;
    }
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
}

.navbar-left {
  flex: 1;
  cursor: pointer;
}

.navbar-left .logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.navbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  margin-top: 10px;
  padding: 10px;
  background: #333;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  z-index: 1000;
}

.dropdown-menu a {
  color: #ffffff;
  text-decoration: none;
  padding: 8px 12px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.dropdown-menu a:hover {
  background-color: #5865f2;
}

.login-button {
  padding: 10px 20px;
  background-color: #5865f2;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #4752c4;
}
</style>

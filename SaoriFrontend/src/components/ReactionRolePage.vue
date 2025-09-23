<template>
  <div class="reaction-role-page">
    <NavigationBar />
    <button @click="toggleSidebar" class="sidebar-toggle" v-if="isMobile">☰</button>
    <div class="config-container">
      <Sidebar @option-selected="" :class="{ hidden: isMobile && isSidebarHidden }" />
      <main class="main-content">
        <section class="config-section">
          <h2>Reaction Role Settings</h2>

          <div v-if="loading">Loading server data...</div>
          <div v-else-if="error">{{ error }}</div>
          <form v-else @submit.prevent="saveReactionRoleSettings" class="form">
            <div class="form-group">
              <label for="channel-select">Channel:</label>
              <select id="channel-select" v-model="reactionRole.channelId" class="form-select">
                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">
                  {{ channel.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="message-id">Message ID:</label>
              <input type="text" id="message-id" v-model="reactionRole.messageId" class="form-input" />
            </div>

            <div class="form-group">
              <label for="emoji-select">Emoji:</label>
              <select id="emoji-select" v-model="reactionRole.emoji" class="form-select">
                <option v-if="emojis.length === 0" disabled>No emojis available</option>
                <option v-for="emoji in emojis" :key="emoji.id || emoji.name" :value="emoji.id || emoji.name">
                  <span v-if="emoji.url">
                    <img :src="emoji.url" class="emoji-image" />
                  </span>
                  {{ emoji.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="role-select">Role:</label>
              <select id="role-select" v-model="reactionRole.roleId" class="form-select">
                <option v-if="roles.length === 0" disabled>No roles available</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name || 'Unnamed Role' }}
                </option>
              </select>
            </div>

            <button type="submit" class="save-button">Save</button>
          </form>

          <div class="preview">
            <h3>Current Settings</h3>
            <ul class="reaction-roles-list">
              <li v-for="(role, index) in previewConfig.reactionRoles" :key="index" class="reaction-role-item">
                <button @click="deleteReactionRole(role)" class="delete-button">Delete</button>
                <span>
                  Channel: {{ role.channel || 'N/A' }},
                  Message ID: {{ role.messageId || 'N/A' }},
                  Emoji:
                  <span v-if="isUrl(role.emoji)">
                    <img :src="role.emoji" alt="emoji" class="emoji-image" />
                  </span>
                  <span v-else>{{ role.emoji || 'N/A' }}</span>,
                  Role: {{ role.role || 'N/A' }}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import apiService from "@/services/apiService";

export default {
  components: { NavigationBar, Sidebar },
  data() {
    return {
      textChannels: [],
      emojis: [],
      roles: [],
      reactionRole: { channelId: "", messageId: "", emoji: "", roleId: "" },
      previewConfig: { reactionRoles: [] },
      isSidebarHidden: false,
      isMobile: window.innerWidth <= 768,
      loading: true,
      error: null,
    };
  },
  created() {
    window.addEventListener("resize", this.checkMobile);
    this.fetchServerData();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    async fetchServerData() {
      const serverId = this.$route.params.serverId;

      try {
        // 同步取得三個端點資料
        const [channelsRes, rolesRes, emojisRes] = await Promise.all([
          apiService.get(`/api/${serverId}/channels`),
          apiService.get(`/api/${serverId}/roles`),
          apiService.get(`/api/${serverId}/emojis`),
        ]);

        // 1️⃣ 驗證並處理頻道資料
        if (!channelsRes.success || !Array.isArray(channelsRes.channels)) {
          throw new Error("Invalid channel response");
        }

        this.textChannels = channelsRes.channels
          .filter((ch) => ch.type === 0) // type === 0 表示文字頻道
          .map((ch) => ({
            id: ch.id,
            name: ch.name,
          }));

        // 2️⃣ 驗證並處理角色資料
        if (!rolesRes.success || !Array.isArray(rolesRes.data)) {
          throw new Error("Invalid role response");
        }

        this.roles = rolesRes.data.map((role) => ({
          id: role.id,
          name: role.name || "Unnamed Role",
        }));

        // 3️⃣ 驗證並處理表情符號資料
        if (!emojisRes.success || !Array.isArray(emojisRes.data)) {
          throw new Error("Invalid emoji response");
        }

        this.emojis = emojisRes.data.map((emoji) => ({
          id: emoji.id,
          name: emoji.name,
          url: emoji.url, // 如果你 API 有給 emoji 圖片連結
        }));

        // 4️⃣ 更新設定預覽（先等 textChannels, roles, emojis 都載好）
        this.fetchPreviewConfig();
      } catch (error) {
        console.error("❌ Error fetching server data:", error);
        alert("Failed to load server configuration. Please check the bot permission or API.");
      } finally {
        this.loading = false; // 無論成功或失敗都結束 loading 狀態
      }
    },
    async fetchPreviewConfig() {
      const serverId = this.$route.params.serverId;

      try {
        const response = await apiService.get(`/api/${serverId}/reaction-roles`);

        // 驗證 response 結構
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Invalid reaction role response format");
        }

        this.previewConfig.reactionRoles = response.data.map((item) => ({
          channel: this.textChannels.find((ch) => ch.id === item.channel_id)?.name || "Unknown Channel",
          messageId: item.message_id,
          emoji: this.emojis.find((e) => e.id === item.emoji)?.name || item.emoji,
          role: this.roles.find((r) => r.id === item.role_id)?.name || "Unknown Role",
        }));
      } catch (error) {
        console.error("❌ Failed to fetch preview configuration:", error);
        alert("Failed to load preview configuration. Please try again later.");
      }
    },
    async saveReactionRoleSettings() {
      const serverId = this.$route.params.serverId;
      try {
        console.log("Saving:", this.reactionRole);
        await apiService.post(`/api/${serverId}/reaction-roles`, this.reactionRole);
        alert("Reaction Role saved successfully!");
        this.fetchPreviewConfig();
      } catch (error) {
        console.error("Failed to save Reaction Role:", error);
        alert("Failed to save. See console for details.");
      }
    },
    async deleteReactionRole(role) {
      const serverId = this.$route.params.serverId;
      try {
        await apiService.delete(`/api/${serverId}/reaction-roles`, {
          messageId: role.messageId,
          emoji: role.emoji, // 可傳 name 或 id
        });
        alert("Reaction Role deleted successfully!");
        this.fetchPreviewConfig();
      } catch (error) {
        console.error("Failed to delete Reaction Role:", error);
        alert("Failed to delete. See console for details.");
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarHidden = !this.isSidebarHidden;
      }
    },
    isUrl(str) {
      return typeof str === "string" && str.startsWith("http");
    },
  },
};
</script>

<style scoped>
.reaction-role-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #7289da, #4b2c5e);
  color: #ffffff;
}

.sidebar-toggle {
    background: #2e3136;
    color: #ffffff;
    border: none;
    padding: 10px;
    font-size: 18px;
    cursor: pointer;
    position: fixed;
    top: 15px;
    right: 70px;
    z-index: 20;
    border-radius: 5px;
}

.config-container {
  display: flex;
  flex: 1;
}

.sidebar {
    width: 250px;
    background-color: #2e3136;
    padding: 20px;
    transition: transform 0.3s ease;
}

.sidebar.hidden {
    transform: translateX(-100%);
    visibility: hidden;
    position: absolute;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.form {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: rgba(255, 255, 255, 0.9);
  color: #000000;
  font-size: 16px;
}

.form-select:focus,
.form-input:focus {
  border-color: #7289da;
  outline: none;
}

.save-button {
  background-color: #7289da;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.save-button:hover {
  background-color: #5a6bb7;
}

.preview {
  margin-top: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
}

.reaction-roles-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reaction-role-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
}

.reaction-role-item > span {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.reaction-role-item > button.delete-button {
  background-color: #ff4757;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.reaction-role-item > button.delete-button:hover {
  background-color: #e03e4f;
}

.emoji-image {
  height: 1.2em;
  vertical-align: middle;
}

/* RWD 原始設定 */
@media (min-width: 769px) {

  .sidebar {
      transform: none !important;
      visibility: visible !important;
      position: relative !important;
  }

  .sidebar-toggle{
    display: none;
  }

  .reaction-role-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .reaction-role-item > span {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .reaction-role-item > button.delete-button {
    align-self: flex-end;
    margin-top: 8px;
  }
}

.emoji-image {
  height: 1.2em;
  vertical-align: middle;
  margin-right: 4px;
}
</style>

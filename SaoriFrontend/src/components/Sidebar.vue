<template>
  <aside class="sidebar">
    <ul class="sidebar-menu">
      <li
        v-for="option in menuOptions"
        :key="option.name"
        :class="['sidebar-option', { active: $route.name === option.name }]"
        @click="navigateTo(option.name)"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo(option.name)"
      >
        {{ option.label }}
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    serverId: {
      type: String,
      required: false, // 如果側邊欄需要動態參數，可以傳入
    },
  },
  data() {
    return {
      menuOptions: [
        { name: 'guildmember', label: 'Welcome Messages' },
        { name: 'reactionrole', label: 'Reaction Roles' },
        { name: 'dynamicvoicechannel', label: 'Dynamic Voice Channels' },
        { name: 'trackingmembersnumber', label: 'Tracking Members Number' },
        { name: 'logchannel', label: 'Log Settings' },
      ],
    };
  },
  methods: {
    navigateTo(routeName) {
      try {
        // 如果有 serverId，傳遞為路由參數
        const params = this.serverId ? { serverId: this.serverId } : {};
        this.$router.push({ name: routeName, params });
      } catch (error) {
        console.error(`Navigation error: ${error.message}`);
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2e3136;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
.sidebar-option {
  width: 90%;
  padding: 12px;
  margin: 8px auto;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #c5c5c5;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  text-align: center;
}
.sidebar-option:hover {
  background-color: #40444b;
  color: #ffffff;
}
.sidebar-option.active {
  background-color: #7289da;
  color: #ffffff;
}
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-height: auto;
    padding-top: 10px;
  }
  .sidebar-option {
    font-size: 12px;
  }
}
</style>
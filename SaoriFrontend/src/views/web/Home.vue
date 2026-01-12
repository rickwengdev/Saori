<template>
  <div class="web-container">
    <n-layout>
      <n-layout-header bordered class="nav-header">
        <div class="logo">Saori System</div>
        <div class="nav-links">
          <n-button text @click="$router.push('/')">Home</n-button>
          <n-button text @click="$router.push('/blog')">Blog</n-button>
          <n-button type="primary" ghost @click="$router.push('/projects')">Projects</n-button>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 50px;">
        <n-grid x-gap="12" :cols="2">
          <n-gi>
            <div class="hero-text">
              <h1 class="glitch-text">I am Rick Weng.</h1>
              <p>Full Stack Developer | Saori Project Creator</p>
                <n-space>
                <n-button type="primary" size="large" @click="$router.push('/chat')">
                    Talk to Saori AI
                </n-button>
                <n-button size="large" @click="$router.push('/projects')">
                    View My Work
                </n-button>
                </n-space>
            </div>
          </n-gi>
          <n-gi>
            <n-card title="System Status">
              <n-statistic label="Saori Core" value="Online" />
              <n-divider />
              <n-statistic label="Knowledge Base" value="Loaded" />
            </n-card>
          </n-gi>
        </n-grid>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup>
import { NLayout, NLayoutHeader, NLayoutContent, NButton, NGrid, NGi, NCard, NStatistic, NSpace, NDivider } from 'naive-ui';
</script>

<style scoped>
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
}
.nav-links {
  display: flex;
  gap: 20px;
}
.hero-text {
  margin-top: 50px;
}
h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}
</style>
<template>
  <div class="projects-container">
    <n-layout>
      <n-layout-header bordered class="nav-header">
        <div class="logo" @click="$router.push('/')" style="cursor: pointer;">Saori System</div>
        <div class="nav-links">
          <n-button text @click="$router.push('/')">Home</n-button>
          <n-button text type="primary">Projects</n-button>
          <n-button text @click="$router.push('/blog')">Blog</n-button>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px;">
        <div class="content-wrapper">
          <h2 class="page-title">My Side Projects</h2>
          <p class="page-subtitle">A collection of my experiments, tools, and chaos.</p>
          
          <n-divider />

          <n-grid :x-gap="24" :y-gap="24" cols="1 s:1 m:2 l:3" responsive="screen">
            <n-grid-item v-for="project in projects" :key="project.id">
              <n-card hoverable class="project-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ project.title }}</span>
                    <n-tag :type="project.statusType" size="small" round>{{ project.status }}</n-tag>
                  </div>
                </template>
                
                <template #cover v-if="project.cover">
                  <img :src="project.cover" class="card-cover">
                </template>

                <div class="card-body">
                  <p>{{ project.description }}</p>
                  <n-space size="small" style="margin-top: 12px;">
                    <n-tag v-for="tech in project.stack" :key="tech" size="tiny" bordered :bordered="false" type="info">
                      {{ tech }}
                    </n-tag>
                  </n-space>
                </div>

                <template #action>
                  <n-space justify="end">
                    <n-button size="small" secondary @click="openLink(project.github)">
                      GitHub
                    </n-button>
                    <n-button size="small" type="primary" @click="handleAction(project)">
                      {{ project.actionText || 'Visit' }}
                    </n-button>
                  </n-space>
                </template>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  NLayout, NLayoutHeader, NLayoutContent, NButton, 
  NGrid, NGridItem, NCard, NTag, NSpace, NDivider 
} from 'naive-ui';

const router = useRouter();

// 模擬專案數據
const projects = ref([
  {
    id: 1,
    title: 'Personal Portfolio',
    description: '就是你現在看到的網站，設計極簡且高效。',
    status: 'In Progress',
    statusType: 'info',
    stack: ['Vue 3', 'Vite', 'Naive UI'],
    actionText: 'Visit',
    internalLink: '/',
    github: 'https://github.com/rickwengdev/Saori-AllinOneAPP/tree/main/SaoriFrontend'
  },
  {
    id: 2,
    title: 'Saori Disocord Bot & Dashboard',
    description: 'A full-stack system integrating Discord Bot and Dashboard.',
    status: 'Live',
    statusType: 'success',
    stack: ['Vue 3', 'Node.js', 'OpenAI SDK', 'Discord.js'],
    actionText: 'Console',
    internalLink: '/discordhome', // 這是指向你原本後台的連結
    github: 'https://github.com/rickwengdev/Saori-AllinOneAPP'
  },
  
]);

const openLink = (url) => {
  if (url) window.open(url, '_blank');
};

const handleAction = (project) => {
  if (project.internalLink) {
    router.push(project.internalLink);
  } else if (project.demo) {
    window.open(project.demo, '_blank');
  }
};
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
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.page-subtitle {
  color: #888;
  margin-bottom: 2rem;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
</style>
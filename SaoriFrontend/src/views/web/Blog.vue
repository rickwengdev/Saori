<template>
  <n-layout style="min-height: 100vh;">
    <n-layout-header bordered style="padding: 20px;">
      <n-page-header @back="$router.push('/')">
        <template #title>Technical Blog</template>
        <template #extra>
          <n-button>RSS Subscribe</n-button>
        </template>
      </n-page-header>
    </n-layout-header>

    <n-layout-content content-style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <n-list hoverable clickable>
        <n-list-item v-for="i in 5" :key="i">
          <template #prefix>
            <n-avatar shape="square" :size="48" src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bb.png" />
          </template>
          <n-thing title="Integrating Google Gemini with Node.js" title-extra="2026-01-12">
            <template #description>
              <n-tag type="success" size="small">Backend</n-tag>
              <n-tag type="info" size="small">AI</n-tag>
            </template>
            這篇文章記錄了我如何將 Saori Backend 的大腦從傳統邏輯升級為 RAG AI Agent...
          </n-thing>
        </n-list-item>
      </n-list>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import { NLayout, NLayoutHeader, NLayoutContent, NPageHeader, NButton, NList, NListItem, NThing, NAvatar, NTag } from 'naive-ui';
</script>
<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme } from 'naive-ui';
</script>

<style>
/* 全局重置 */
body {
  margin: 0;
  padding: 0;
  font-family: v-sans, system-ui, -apple-system, sans-serif;
  background-color: #101014; /*配合暗色主題*/
  color: #fff;
}
</style>
<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            
            <NaiveContext>
              <router-view />
            </NaiveContext>

          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui';
import NaiveContext from '@/components/NaiveContext.vue'; // 引入掛載元件

// 自定義主題顏色 (配合你的 Discord 風格)
const themeOverrides = {
  common: {
    primaryColor: '#5865F2', 
    primaryColorHover: '#4752C4',
    primaryColorPressed: '#404EED',
  },
};
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #101014;
}
</style>
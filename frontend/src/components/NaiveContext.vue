<template>
  <slot />
</template>

<script setup>
import { useMessage, useDialog, useNotification, useLoadingBar } from 'naive-ui';

// 將 Naive UI 的 API 掛載到 window 物件
window.$message = useMessage();
window.$dialog = useDialog();
window.$notification = useNotification();
window.$loading = useLoadingBar();
</script>
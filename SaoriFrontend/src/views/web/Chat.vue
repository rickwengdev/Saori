<template>
  <div class="chat-container">
    <n-layout style="height: 100vh">
      <n-layout-header bordered class="chat-header">
        <div class="header-left">
          <n-button text style="font-size: 1.2rem; margin-right: 15px;" @click="$router.push('/')">
            ←
          </n-button>
          <n-avatar
            round
            size="small"
            src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f916.png"
            style="margin-right: 10px;"
          />
          <div class="bot-info">
            <span class="bot-name">Saori AI (RAG Core)</span>
            <span class="bot-status">Online • {{ connectionStatus }}</span>
          </div>
        </div>
      </n-layout-header>

      <n-layout-content 
        class="chat-content" 
        ref="scrollContainer"
        :native-scrollbar="false"
      >
        <div class="messages-wrapper">
          <div v-if="messages.length === 0" class="empty-state">
            <h3>我是 Saori。</h3>
            <p>我可以讀取專案原始碼，協助你開發或回答架構問題。</p>
            <div class="suggestion-chips">
              <n-tag clickable @click="fillInput('解釋一下 AgentService 的邏輯')">解釋 AgentService</n-tag>
              <n-tag clickable @click="fillInput('目前的專案目錄結構是什麼？')">專案結構</n-tag>
              <n-tag clickable @click="fillInput('幫我寫一個新的 Vue 組件')">生成代碼</n-tag>
            </div>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']"
          >
            <n-avatar
              v-if="msg.role === 'bot'"
              round
              size="small"
              src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f916.png"
              class="msg-avatar"
            />
            
            <div class="message-bubble">
              <div v-if="msg.role === 'bot'" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
              <div v-else>{{ msg.content }}</div>
            </div>
          </div>

          <div v-if="loading" class="message-row bot-row">
            <n-avatar round size="small" src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f916.png" class="msg-avatar" />
            <div class="message-bubble loading-bubble">
              <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
            </div>
          </div>
        </div>
      </n-layout-content>

      <n-layout-footer bordered class="chat-footer">
        <div class="input-wrapper">
          <n-input
            v-model:value="inputText"
            type="textarea"
            placeholder="Send a message to Saori..."
            :autosize="{ minRows: 1, maxRows: 4 }"
            @keydown.enter.prevent="sendMessage"
            :disabled="loading"
          />
          <n-button type="primary" class="send-btn" @click="sendMessage" :disabled="loading || !inputText.trim()">
            Send
          </n-button>
        </div>
        <div class="footer-note">AI can make mistakes. Check important info.</div>
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter, NButton, NInput, NAvatar, NTag } from 'naive-ui';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // 代碼高亮樣式
import apiService from '@/services/apiService';

// 初始化 Markdown 渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 狀態變數
const messages = ref([]);
const inputText = ref('');
const loading = ref(false);
const scrollContainer = ref(null);
const connectionStatus = ref('Connected');

const renderMarkdown = (text) => {
  return md.render(text);
};

const fillInput = (text) => {
  inputText.value = text;
};

const scrollToBottom = async () => {
  await nextTick();
  const content = document.querySelector('.n-layout-content'); // 獲取 Naive UI 的內容容器
  if (content) {
    content.scrollTop = content.scrollHeight;
  }
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  // 1. 顯示用戶訊息
  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    // 2. 呼叫後端 API
    // 注意：這裡是直接呼叫我們剛剛寫好的 Agent 模組
    // sessionId 可以隨機生成，或者用固定的用戶 ID
    const response = await apiService.post(`/agent/chat`, {
      sessionId: 'web-user-' + Date.now(), // 簡單的 Session ID
      message: text
    });

    console.log("🔥 Backend Response:", response.data); // 這行會讓你在瀏覽器 Console 看到後端到底回了什麼

    if (response.data && response.data.reply) {
       // 成功情況
       messages.value.push({ role: 'bot', content: response.data.reply });
    } else if (response.data && response.data.error) {
       // 後端明確回傳錯誤訊息的情況
       throw new Error(`Server Error: ${response.data.error}`);
    } else {
       // 格式完全無法識別
       throw new Error(`Invalid response format: ${JSON.stringify(response.data)}`);
    }

  } catch (error) {
    console.error(error);
    const errorMsg = error.response?.data?.error || error.message;
    messages.value.push({ 
      role: 'bot', 
      content: `**[System Error]**: 無法連線到 Saori Core。\n\`\`\`\n${errorMsg}\n\`\`\`` 
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
/* 樣式部分 */
.chat-container {
  height: 100vh;
  background-color: #101014; /* 深色背景 */
  color: #fff;
}

.chat-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.bot-info {
  display: flex;
  flex-direction: column;
}

.bot-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.bot-status {
  font-size: 0.75rem;
  color: #63e2b7; /* Naive UI Green */
}

.chat-content {
  background-color: #101014;
}

.messages-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  margin-top: 100px;
  opacity: 0.8;
}

.suggestion-chips {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-row {
  flex-direction: row-reverse;
}

.msg-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  line-height: 1.6;
  font-size: 0.95rem;
  word-wrap: break-word;
}

/* User Bubble Style */
.user-row .message-bubble {
  background-color: #63e2b7; /* Naive Primary Color */
  color: #000;
  border-bottom-right-radius: 2px;
}

/* Bot Bubble Style */
.bot-row .message-bubble {
  background-color: #2d2d30;
  color: #e0e0e0;
  border-bottom-left-radius: 2px;
}

/* Loading Animation */
.loading-bubble {
  display: flex;
  gap: 4px;
  padding: 15px 20px;
}
.dot {
  animation: wave 1.3s linear infinite;
}
.dot:nth-child(2) { animation-delay: -1.1s; }
.dot:nth-child(3) { animation-delay: -0.9s; }

@keyframes wave {
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-5px); }
}

.chat-footer {
  padding: 20px;
  background-color: #101014;
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.send-btn {
  height: auto;
  min-height: 34px;
}

.footer-note {
  text-align: center;
  font-size: 0.7rem;
  color: #555;
  margin-top: 8px;
}

/* Markdown Styles Override */
.markdown-body :deep(pre) {
  background-color: #1e1e1e;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(p) {
  margin-bottom: 0.5em;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
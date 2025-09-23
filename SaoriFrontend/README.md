# SaoriFrontend

SaoriFrontend 是一個基於 Vite 的前端應用程序，旨在為 Discord 機器人提供用戶友好的管理界面。此項目設計簡單，易於維護，並且支持快速開發和部署。

---

## 特性

- **快速開發**：使用 Vite 作為構建工具，提供極快的開發體驗。
- **模塊化設計**：代碼結構清晰，易於擴展和維護。
- **API 集成**：與後端 API 無縫對接，實現數據交互。
- **響應式設計**：適配各種設備，提供良好的用戶體驗。

---

## 目錄結構

項目遵循清晰的分層結構，方便理解和開發：

```
SaoriFrontend/
├── public/            # 靜態資源
├── src/               # 源碼目錄
│   ├── assets/        # 靜態資源（圖片、樣式等）
│   ├── components/    # React 組件
│   ├── services/      # API 請求服務
│   ├── App.jsx        # 主應用組件
│   ├── main.jsx       # 應用入口
│   └── router.jsx     # 路由配置
├── index.html         # 主 HTML 文件
├── package.json       # 項目依賴和腳本
└── vite.config.js     # Vite 配置文件
```

---

## 環境設置

### 1. 克隆項目

```bash
git clone https://github.com/rickwengdev/SaoriFrontend.git
```

### 2. 安裝依賴

```bash
cd SaoriFrontend
npm install
```

### 3. 配置環境變量

創建 `.env` 文件並設置以下變量：

```bash
VITE_APP_BASE_URL=https://localhost:3000
VITE_APP_ClientId=`YOUR_DISCORD_CLIENT_ID`
```

### 4. 將SSL檔案並加入根目錄

將SSL檔案 `server.crt` `server.key` 放入根目錄

---

## 如何運行應用程序

### 開發模式

使用 Vite 啟動開發服務：

```bash
npm run dev
```

### 生產模式

構建生產版本：

```bash
npm run build
```

並使用以下命令運行：

```bash
npm run serve
```

---

## 項目架構詳解

### 1. Components（組件）

頁面組件負責渲染不同的路由。例如：

- `DashboardPage.vue`：儀表板頁面。
- `SettingsPage.vue`：設置頁面。

### 2. Services（服務層）

封裝 API 請求邏輯，便於重用。例如：

- `apiService.js`：處理與後端的數據交互。

### 3. Router（路由）

定義應用程序的路由配置。例如：

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/HomePage.vue';
import Dashboard from '../components/DashboardPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

---

## 測試

目前該項目已通過功能測試，建議後續集成單元測試框架（如 Jest 或 React Testing Library）進行代碼覆蓋測試。

### 常見問題排查

1. 應用程序無法啟動
    - 確保 `.env` 文件配置正確。
    - 檢查 API 服務是否運行。
2. 依賴問題
    - 使用 `npm install` 確保所有依賴安裝到位。

---

## 貢獻指南

歡迎社群參與貢獻！請遵循以下步驟：

### 1. Fork 此存儲庫

### 2. 創建功能分支

```bash
git checkout -b feature/YourFeature
```

### 3. 提交更改

```bash
git commit -m "Add YourFeature"
```

### 4. 推送分支

```bash
git push origin feature/YourFeature
```

### 5. 創建 Pull Request，等待審核與合併

---

## 許可證

目前未設置開源協議，建議後續加入 MIT 或 Apache 2.0 協議。

---

## 聯繫方式

如需技術支持或提交問題，請聯繫項目所有者或在 GitHub 上創建 Issue。

GitHub 項目連結：[SaoriFrontend](https://github.com/rickwengdev/SaoriFrontend)
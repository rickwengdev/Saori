# ------------------------
# Build stage: Build the frontend app
# ------------------------
FROM node:18-slim AS build

WORKDIR /app

# 複製 package.json 與 lock 檔以加快快取
COPY package*.json ./
RUN npm install

# 複製其他檔案並建置
COPY . .
RUN npm run build


# ------------------------
# Production stage: Serve with Nginx
# ------------------------
FROM nginx:alpine

# 複製 build 後的靜態檔案到 Nginx 預設路徑
COPY --from=build /app/dist /usr/share/nginx/html

# 複製自訂 Nginx 設定檔
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 複製 SSL 憑證與私鑰（你必須將 server.crt / server.key 放在專案根目錄）
COPY /cert/server.crt /etc/nginx/server.crt
COPY /cert/server.key /etc/nginx/server.key

# 開啟 HTTP 與 HTTPS 端口
EXPOSE 80
EXPOSE 443

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]

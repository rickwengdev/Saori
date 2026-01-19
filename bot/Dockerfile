# 使用輕量化 Node.js 版本
FROM node:18-alpine

# 安裝必要的系統套件 (有些 Discord 語音套件可能需要 python/make/g++)
# 如果你的 Bot 有用到 @discordjs/voice 或 sodium，請保留下面這行；如果沒用到語音可拿掉
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

COPY . .

# Bot 不需要 EXPOSE，因為它是主動連線出去的
CMD [ "node", "src/main.js" ]
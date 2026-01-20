# 使用輕量化 Node.js 版本
FROM node:25-alpine

# ffmpeg-static 在 Alpine 上常會掛掉，直接用系統安裝的 ffmpeg 最穩
# python3, make, g++ 是為了 @discordjs/voice 的原生編譯
RUN apk add --no-cache python3 make g++ ffmpeg libc6-compat

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

COPY . .

# Bot 不需要 EXPOSE，因為它是主動連線出去的 
RUN node .deploy-commands.js

CMD [ "node", "src/main.js" ]
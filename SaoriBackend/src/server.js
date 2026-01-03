const app = require('./app');
const Logger = require('./shared/utils/Logger');
const fs = require('fs');
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const isHttps = process.env.USE_HTTPS === 'true';

if (isHttps) {
    // HTTPS 啟動 (如果需要)
    const sslOptions = {
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt'),
    };
    https.createServer(sslOptions, app).listen(PORT, () => {
        Logger.info(`HTTPS Server is running on port ${PORT}`);
    });
} else {
    // 開發環境或 Docker 內部通常用 HTTP
    http.createServer(app).listen(PORT, () => {
        Logger.info(`HTTP Server is running on port ${PORT}`);
    });
}
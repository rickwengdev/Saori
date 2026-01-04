const app = require('./app');
const Logger = require('./shared/utils/Logger');
const fs = require('fs');
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const isHttps = process.env.USE_HTTPS === 'true';

async function startServer() {
    const { initializeApp } = require('./app');
    const appInstance = await initializeApp();

    if (isHttps) {
        const sslOptions = {
            key: fs.readFileSync(process.env.SSL_KEY_PATH || './certs/server.key'),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH || './certs/server.crt'),
        };
        https.createServer(sslOptions, appInstance).listen(PORT, () => {
            Logger.info(`HTTPS Server is running on port ${PORT}`);
        });
    } else {
        http.createServer(appInstance).listen(PORT, () => {
            Logger.info(`HTTP Server is running on port ${PORT}`);
        });
    }
}

startServer();
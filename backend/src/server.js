import { info, error as _error } from './shared/utils/Logger';
import { createServer } from 'http';

// Cloud Run 會自動注入 PORT 環境變數 (通常是 8080)
const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        const { initializeApp } = require('./app');
        const appInstance = await initializeApp();
        
        createServer(appInstance).listen(PORT, () => {
            info(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        _error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
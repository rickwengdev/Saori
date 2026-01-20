import fs from 'fs';
import logger from '../../utils/Logger.js';

/** @type {Map<string, string[]>} */
export let playlists = new Map();

const playlistPath = './features/music/playlists.json';

export const savePlaylists = () => {
    try {
        const data = JSON.stringify(Object.fromEntries(playlists.entries()), null, 2);
        fs.writeFileSync(playlistPath, data, 'utf-8');
    } catch (error) {
        logger.error(`Failed to save playlists to ${playlistPath}`, error);
    }
};

export const loadPlaylists = () => {
    if (fs.existsSync(playlistPath)) {
        try {
            const data = fs.readFileSync(playlistPath, 'utf-8');
            playlists = new Map(Object.entries(JSON.parse(data)));
            logger.info(`Playlists loaded from ${playlistPath}`);
        } catch (error) {
            logger.error(`Failed to load playlists from ${playlistPath}`, error);
        }
    } else {
        logger.warn(`Playlist file not found, starting empty.`);
    }
};

loadPlaylists();
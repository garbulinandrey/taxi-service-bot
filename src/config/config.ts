import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map(id => Number(id)),
    MANAGER_USERNAME: process.env.MANAGER_USERNAME || '',
};
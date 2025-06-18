import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map(id => Number(id)),
    MANAGER_USERNAME: process.env.MANAGER_USERNAME || '',
    OPENAI: {
        API_KEY: process.env.OPENAI_API_KEY || '',
        MODEL: 'gpt-3.5-turbo',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7
    }
};
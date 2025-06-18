import dotenv from 'dotenv';
dotenv.config();

export interface Config {
    BOT_TOKEN: string;
    OPENAI_API_KEY: string;
    ANDROID_APP_URL: string;
    IPHONE_APP_URL: string;
}

export const config: Config = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANDROID_APP_URL: 'https://play.google.com/store/apps/details?id=com.naughtysoft.TtcDriver',
    IPHONE_APP_URL: 'https://apps.apple.com/ru/app/element-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8F/id1449354142'
};

// Проверка наличия необходимых переменных окружения
if (!config.BOT_TOKEN) {
    throw new Error('BOT_TOKEN is required in environment variables');
}

if (!config.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required in environment variables');
}
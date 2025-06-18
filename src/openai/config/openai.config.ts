import { Configuration } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
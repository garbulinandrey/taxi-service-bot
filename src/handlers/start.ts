import { Context } from 'telegraf';
import { mainKeyboard } from '../keyboards/mainKeyboard';
import { responses } from '../utils/responses';

export const handleStart = async (ctx: Context) => {
    try {
        await ctx.reply(responses.start, mainKeyboard);
    } catch (error) {
        console.error('Error in start handler:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
};
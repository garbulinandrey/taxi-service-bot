import { Telegraf, Markup } from 'telegraf';
import { URLS } from '../constants/urls';

export const elementDriverHandler = (bot: Telegraf) => {
    bot.action('element_driver', async (ctx) => {
        try {
            await ctx.editMessageText('Выберите платформу для скачивания приложения:', 
                Markup.inlineKeyboard([
                    [Markup.button.url('Android', URLS.ANDROID_DRIVER_APP)],
                    [Markup.button.url('iPhone', URLS.IPHONE_DRIVER_APP)],
                    [Markup.button.callback('Меню', 'main_menu')]
                ])
            );
        } catch (error) {
            console.error('Error in element driver handler:', error);
            await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    });
};
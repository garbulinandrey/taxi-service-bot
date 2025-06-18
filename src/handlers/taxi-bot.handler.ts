import TelegramBot, { Message } from 'node-telegram-bot-api';
import { OpenAIService } from '../services/openai.service';
import { TaxiResponse } from '../types/taxi-response';

export class TaxiBotHandler {
    private openAIService: OpenAIService;

    constructor(private bot: TelegramBot) {
        this.openAIService = new OpenAIService();
    }

    async handleMessage(message: Message) {
        const chatId = message.chat.id;

        if (!message.text) {
            await this.bot.sendMessage(chatId, 'Пожалуйста, отправьте текстовое сообщение');
            return;
        }

        try {
            await this.bot.sendChatAction(chatId, 'typing');

            const aiResponse = await this.openAIService.getResponse(message.text);
            
            let keyboard;
            switch (aiResponse.intent) {
                case 'service':
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Позвонить в сервис', callback_data: 'call_service' }],
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
                    break;
                case 'car_question':
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Связаться с Владимиром', url: 'https://t.me/VV_Korotkov' }],
                            [{ text: 'Позвонить в сервис', callback_data: 'call_service' }],
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
                    break;
                case 'dtp':
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Связаться с Рузалем', url: 'https://t.me/ruzalru' }],
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
                    break;
                case 'fine_check':
                    keyboard = {
                        inline_keyboard: [
                            [
                                { text: 'Android', url: 'https://play.google.com/store/apps/details?id=com.naughtysoft.TtcDriver' },
                                { text: 'iPhone', url: 'https://apps.apple.com/ru/app/element-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8F/id1449354142' }
                            ],
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
                    break;
                case 'long_distance':
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Связаться с Владимиром', url: 'https://t.me/VV_Korotkov' }],
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
                    break;
                default:
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
            }

            await this.bot.sendMessage(chatId, aiResponse.response, {
                reply_markup: keyboard,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
            });

        } catch (error) {
            console.error('Error handling message:', error);
            await this.bot.sendMessage(
                chatId,
                'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже или воспользуйтесь меню.',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    }
                }
            );
        }
    }

    async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery) {
        const chatId = callbackQuery.message?.chat.id;
        if (!chatId) return;

        const data = callbackQuery.data;

        try {
            switch (data) {
                case 'call_service':
                    await this.bot.sendMessage(chatId, 'Телефон сервиса: 34-45-55 (+79297344555)');
                    break;
                case 'back_to_main':
                    await this.bot.sendMessage(chatId, 'Выберите действие:', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Записаться на ТО/Ремонт', callback_data: 'service' }],
                                [{ text: 'Проблемы с машиной', callback_data: 'car_issue' }],
                                [{ text: 'ДТП', callback_data: 'accident' }],
                                [{ text: 'Штрафы', callback_data: 'fines' }],
                                [{ text: 'Дальние поездки', callback_data: 'long_trip' }]
                            ]
                        }
                    });
                    break;
                case 'service':
                    await this.handleMessage({ 
                        chat: { id: chatId },
                        text: 'Как записаться на ТО?'
                    } as Message);
                    break;
                case 'car_issue':
                    await this.handleMessage({ 
                        chat: { id: chatId },
                        text: 'Проблемы с машиной'
                    } as Message);
                    break;
                case 'accident':
                    await this.handleMessage({ 
                        chat: { id: chatId },
                        text: 'Что делать при ДТП?'
                    } as Message);
                    break;
                case 'fines':
                    await this.handleMessage({ 
                        chat: { id: chatId },
                        text: 'Как посмотреть штрафы?'
                    } as Message);
                    break;
                case 'long_trip':
                    await this.handleMessage({ 
                        chat: { id: chatId },
                        text: 'Дальняя поездка'
                    } as Message);
                    break;
            }
        } catch (error) {
            console.error('Error handling callback query:', error);
            await this.bot.sendMessage(
                chatId,
                'Извините, произошла ошибка. Пожалуйста, попробуйте позже.',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    }
                }
            );
        }
    }
}
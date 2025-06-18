import { Message } from 'node-telegram-bot-api';
import { OpenAIService } from '../services/openai.service';
import TelegramBot from 'node-telegram-bot-api';
import { TaxiResponse } from '../types/taxi-response';
// ... другие импорты ...

export class MessageHandler {
    private openAIService: OpenAIService;

    constructor(private bot: TelegramBot) {
        this.openAIService = new OpenAIService();
    }

    async handleMessage(message: Message): Promise<void> {
        const chatId = message.chat.id;
        const text = message.text;

        if (!text) {
            await this.bot.sendMessage(chatId, 'Пожалуйста, отправьте текстовое сообщение');
            return;
        }

        try {
            await this.bot.sendChatAction(chatId, 'typing');

            const response = await this.openAIService.getResponse(text);
            
            // Формируем клавиатуру в зависимости от intent
            let keyboard;
            switch (response.intent) {
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
                default:
                    keyboard = {
                        inline_keyboard: [
                            [{ text: 'Меню', callback_data: 'back_to_main' }]
                        ]
                    };
            }

            await this.bot.sendMessage(chatId, response.response, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
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
}
/**
 * @file index.ts
 * @description Основной файл бота такси-сервиса
 * @author garbulinandrey
 * @date 2025-06-05 08:05:48
 * @copyright Yotaxi LLC
 */

// Импорты из библиотек
import { Telegraf } from 'telegraf';
import { InputMediaPhoto } from 'telegraf/types';

// Импорты типов
import { MyContext } from './types/context';

// Импорт конфигурации
import { config } from './config/config';

// Импорт клавиатур и текстов
import { 
    mainKeyboard, 
    workQuestionKeyboard,
    workQuestionInfo,
    serviceKeyboard,
    serviceInfo,
    dtpKeyboard,
    dtpInfo,
    dtpNightInfo,
    balanceKeyboard,
    balanceInfo,
    balanceAddKeyboard,
    balanceAddInfo,
    balanceWithdrawKeyboard,
    balanceWithdrawInfo,
    longDistanceKeyboard,
    sickLeaveInfo,
    sickLeaveKeyboard,
    programHelpInfo,
    programHelpKeyboard,
    returnCarInfo,
    returnCarKeyboard,
    groupsInfo,
    groupsKeyboard
} from './keyboards/mainKeyboard';
// Добавить здесь, перед созданием экземпляра бота
const URLS = {
    ANDROID_DRIVER_APP: 'https://play.google.com/store/apps/details?id=com.naughtysoft.TtcDriver',
    IPHONE_DRIVER_APP: 'https://apps.apple.com/ru/app/element-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8F/id1449354142'
};

// Создаем экземпляр бота
const bot = new Telegraf<MyContext>(config.BOT_TOKEN);

/**
 * Инициализируем сессионное хранилище
 * Это нужно для хранения ID сообщений и информации о типе сообщения
 */
bot.use((ctx, next) => {
    ctx.session = {};
    return next();
});

/**
 * Функция для обновления сообщения
 * @param ctx - контекст телеграм бота
 * @param text - текст сообщения
 * @param keyboard - клавиатура для сообщения
 */
async function updateMessage(ctx: MyContext, text: string, keyboard: any) {
    try {
        if (ctx.session.isPhotoMessage) {
            const newMsg = await ctx.reply(text, keyboard);
            
            if (ctx.session.messageId && ctx.chat) {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
                } catch (error) {
                    console.error('Ошибка при удалении предыдущего сообщения:', error);
                }
            }
            
            ctx.session.messageId = newMsg.message_id;
            ctx.session.isPhotoMessage = false;
        } else {
            await ctx.editMessageText(text, keyboard);
        }
    } catch (error) {
        console.error('Ошибка при обновлении сообщения:', error);
        
        const newMsg = await ctx.reply(text, keyboard);
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }
        ctx.session.messageId = newMsg.message_id;
        ctx.session.isPhotoMessage = false;
    }
}

// Обработчики команд и действий

/**
 * Обработчик команды /start
 */
bot.command('start', async (ctx) => {
    try {
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }
        const msg = await ctx.reply('Привет! Я чат-бот автопарка "Центральный". Выберите действие:', { ...mainKeyboard });
        ctx.session.messageId = msg.message_id;
        ctx.session.isPhotoMessage = false;
    } catch (error) {
        console.error('Ошибка в команде start:', error);
    }
});

/**
 * Обработчик кнопки "Вопрос по работе"
 */
bot.action('work_question', async (ctx) => {
    try {
        await updateMessage(ctx, workQuestionInfo, { ...workQuestionKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике вопросов по работе:', error);
    }
});

/**
 * Обработчик кнопки "Заболел, не могу выйти на линию"
 */
bot.action('sick_leave', async (ctx) => {
    try {
        await updateMessage(ctx, sickLeaveInfo, { ...sickLeaveKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике больничного:', error);
    }
});

/**
 * Обработчик кнопки "Нужна помощь с программой"
 */
bot.action('program_help', async (ctx) => {
    try {
        await updateMessage(ctx, programHelpInfo, { ...programHelpKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике помощи с программой:', error);
    }
});

/**
 * Обработчик кнопки "Хочу сдать автомобиль"
 */
bot.action('return_car', async (ctx) => {
    try {
        await updateMessage(ctx, returnCarInfo, { ...returnCarKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике сдачи автомобиля:', error);
    }
});

/**
 * Обработчик кнопки "Запись на сервис"
 */
bot.action('service', async (ctx) => {
    try {
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }

        const msg = await ctx.replyWithMediaGroup([{
            type: 'photo',
            media: { source: './src/assets/images/service_map.png' },
            caption: serviceInfo
        } as InputMediaPhoto]);

        const keyboardMsg = await ctx.reply('Выберите действие:', { ...serviceKeyboard });

        ctx.session.messageId = keyboardMsg.message_id;
        ctx.session.isPhotoMessage = true;
    } catch (error) {
        console.error('Ошибка в обработчике сервиса:', error);
    }
});

/**
 * Обработчик для записи на ТО или ремонт
 */
bot.action('service_appointment', async (ctx) => {
    try {
        await updateMessage(
            ctx,
            'Записаться на сервис можно по номеру:\n344-555 (+79297344555)',
            { ...serviceKeyboard }
        );
    } catch (error) {
        console.error('Ошибка в обработчике записи на сервис:', error);
    }
});

/**
 * Обработчик кнопки "Вопросы по работе автомобиля"
 */
bot.action('car_questions', async (ctx) => {
    try {
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }

        const msg = await ctx.reply('Позвоните на сервис 34-45-55 (+79297344555)nили Владимиру Короткову в рабочее время с 9-00 до 18-00', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Владимир Коротков', url: 'https://t.me/VV_Korotkov' }],
                    [{ text: 'Меню', callback_data: 'back_to_main' }]
                ]
            }
        });

        ctx.session.messageId = msg.message_id;
    } catch (error) {
        console.error('Ошибка в обработчике вопросов по работе автомобиля:', error);
    }
});

/**
 * Обработчик кнопки "У меня ДТП"
 */
bot.action('dtp', async (ctx) => {
    try {
        await updateMessage(ctx, dtpInfo, { ...dtpKeyboard, parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Ошибка в обработчике ДТП:', error);
    }
});

/**
 * Обработчик для ночного ДТП
 */
bot.action('dtp_night', async (ctx) => {
    try {
        await updateMessage(ctx, dtpNightInfo, { ...dtpKeyboard, parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Ошибка в обработчике ночного ДТП:', error);
    }
});
/**
 * Обработчик кнопки "Элемент водитель"
 */
bot.action('element_driver', async (ctx) => {
    try {
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }

        // Отправляем изображение с подписью и кнопками
        const msg = await ctx.replyWithPhoto(
            { source: './src/assets/images/element_driver_app.png' },
            {
                caption: 'Выберите платформу для скачивания приложения:',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Android', url: URLS.ANDROID_DRIVER_APP }],
                        [{ text: 'iPhone', url: URLS.IPHONE_DRIVER_APP }],
                        [{ text: 'Меню', callback_data: 'back_to_main' }]
                    ]
                }
            }
        );

        ctx.session.messageId = msg.message_id;
        ctx.session.isPhotoMessage = true;
    } catch (error) {
        console.error('Ошибка в обработчике Element Driver:', error);
    }
});
/**
 * Обработчик кнопки "Пополнить/снять с баланса"
 */
bot.action('balance', async (ctx) => {
    try {
        await updateMessage(ctx, balanceInfo, { ...balanceKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике баланса:', error);
    }
});

/**
 * Обработчик кнопки "Пополнить переводом"
 */
bot.action('balance_add', async (ctx) => {
    try {
        await updateMessage(ctx, balanceAddInfo, { ...balanceAddKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике пополнения баланса:', error);
    }
});

/**
 * Обработчик кнопки "Как снять деньги?"
 */
bot.action('balance_withdraw', async (ctx) => {
    try {
        await updateMessage(ctx, balanceWithdrawInfo, { ...balanceWithdrawKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике снятия денег:', error);
    }
});

/**
 * Обработчик кнопки "Дальние поездки"
 */
bot.action('long_distance', async (ctx) => {
    try {
        if (ctx.session.messageId && ctx.chat) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.messageId);
            } catch (error) {
                console.error('Ошибка при удалении предыдущего сообщения:', error);
            }
        }

        const msg = await ctx.replyWithPhoto(
            { source: './src/assets/images/map.png' },
            {
                caption: 'На автомобиле Вы можете передвигаться по всей Республике и в пределах области отмеченной на карте. ' +
                        'Если Вы выезжаете за пределы данной области автомобиль заблокируется. Будьте внимательны!\n\n' +
                        'Согласовать поездку Вы можете с Владимиром Коротковым в рабочее время.',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Владимир Коротков', url: 'https://t.me/VV_Korotkov' }],
                        [{ text: 'Меню', callback_data: 'back_to_main' }]
                    ]
                }
            }
        );

        ctx.session.messageId = msg.message_id;
        ctx.session.isPhotoMessage = true;
    } catch (error) {
        console.error('Ошибка в обработчике дальних поездок:', error);
    }
});

/**
 * Обработчик кнопки "Ссылки на группы"
 */
bot.action('groups', async (ctx) => {
    try {
        await updateMessage(ctx, groupsInfo, { ...groupsKeyboard });
    } catch (error) {
        console.error('Ошибка в обработчике групп:', error);
    }
});

/**
 * Обработчик для возврата в главное меню
 */
bot.action('back_to_main', async (ctx) => {
    try {
        await updateMessage(ctx, 'Выберите действие:', { ...mainKeyboard });
    } catch (error) {
        console.error('Ошибка при возврате в главное меню:', error);
    }
});

/**
 * Обработчик для неизвестных действий
 */
bot.action(/.+/, async (ctx) => {
    try {
        await ctx.answerCbQuery('Данная функция в разработке');
    } catch (error) {
        console.error('Ошибка в обработчике неизвестного действия:', error);
    }
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('Бот успешно запущен');
    })
    .catch((error) => {
        console.error('Ошибка при запуске бота:', error);
    });

// Корректное завершение работы бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
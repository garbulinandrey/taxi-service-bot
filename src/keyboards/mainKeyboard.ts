/**
 * @file mainKeyboard.ts
 * @description Клавиатуры и тексты для бота такси-сервиса
 * @author garbulinandrey
 * @date 2025-05-27 15:40:24
 */

import { Markup } from 'telegraf';

// Главное меню
export const mainKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Вопрос по работе', 'work_question')],
    [Markup.button.callback('Запись на сервис', 'service')],
    [Markup.button.callback('У меня ДТП', 'dtp')],
    [Markup.button.callback('Пополнить/снять с баланса', 'balance')],
    [Markup.button.callback('Ссылки на группы', 'groups')],
    [Markup.button.callback('Дальние поездки', 'long_distance')],
    [Markup.button.callback('Жалобы/Предложения', 'complaints')],
    [Markup.button.callback('Вопросы/Предложения по боту', 'bot_questions')]
]);

// Текст для вопросов по работе
export const workQuestionInfo = `График работы офиса:

Понедельник - Пятница
с 9-00 до 19-00

Суббота - Воскресенье
с 10-00 до 17-00`;

// Клавиатура для вопросов по работе
export const workQuestionKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Заболел, не могу выйти на линию', 'sick_leave')],
    [Markup.button.callback('Нужна помощь с программой', 'program_help')],
    [Markup.button.callback('Хочу сдать автомобиль', 'return_car')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для болезни
export const sickLeaveInfo = `Если Вы заболели, либо по другим причинам не можете выйти на работу, то сообщите об этом по номеру
+79278835566 или напишите в телеграм.
НАПОМИНАНИЕ: Если Вы не сообщили о том, что не можете выйти на линию - аренда не пересчитывается.`;

// Клавиатура для болезни
export const sickLeaveKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Офис', 'https://t.me/yotaxi')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для помощи с программой
export const programHelpInfo = `Распишите подробно, чем нужно помочь менеджеру или можете заехать в офис для решения вопроса.
+79278835566`;

// Клавиатура для помощи с программой
export const programHelpKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Офис', 'https://t.me/yotaxi')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для сдачи автомобиля
export const returnCarInfo = `Сдача автомобиля происходит до 15-00 с понедельника по пятницу или в выходные с 17-20 до 18-00 на Строителей 100А. О сдаче автомобиля нужно предупреждать за 2 дня . Написать о сдаче автомобиля в офис: ФИО, номер машины, когда хотите сдать автомобиль или предупредить на плановом осмотре на базе.`;

// Клавиатура для сдачи автомобиля
export const returnCarKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Сдача автомобиля', 'https://t.me/yotaxi')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Клавиатура для сервиса
export const serviceKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Записаться на ТО или на ремонт автомобиля', 'service_appointment')],
    [Markup.button.callback('Вопросы по работе автомобиля', 'car_questions')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Общий текст для сервиса
export const serviceInfo = `Наш сервис
График работы:
Понедельник - Пятница
с 9-00 до 18-00.
Суббота - Воскресенье: выходной
344-555 (+79297344555)
Строителей 100А
(Заезд со стороны Автосалона Chery, с Кокшайского тракта)
ТО (замена масла, фильтров)- необходимо делать на пробеге кратном 10 000км.
Пример 30 000, 40 000, 50 000 и т.д.
При выдаче машины уточните пробег для прохождения ТО`;

// Клавиатура для ДТП
export const dtpKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Если произошло ночью и не дозвонились', 'dtp_night')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для ДТП
export const dtpInfo = `Если попали в ДТП, необходимо оказать первую помощь себе и своим пассажирам. Связаться с [Рузалем Габдрахмановым](https://t.me/ruzalru) по телефону (+7937 936-00-19) или написать в телеграмме и действовать по его указанию.`;

// Текст для ночного ДТП
export const dtpNightInfo = `Сфотографируете место ДТП таким образом, чтобы можно было понять где это, на фоне указателя, вывески и т.д.

Расположение автомобилей, повреждения всех автомобилей с разных ракурсов, чтобы было видно, как можно лучше и детальнее.ы

Фотографии нужно отправить [Рузалю Габдрахманову](https://t.me/ruzalru) в телеграм.

При оформлении сотрудниками ГИБДД, давать объяснение только по факту ДТП. При спорной ситуации заявлять ходатайства о предоставлении защитника с записью в протоколе.`;

// Клавиатура для баланса
export const balanceKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Пополнить переводом', 'balance_add')],
    [Markup.button.callback('Как снять деньги?', 'balance_withdraw')],
    [Markup.button.callback('Элемент водитель', 'element_driver')], // Изменено с URL на callback
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для информации о балансе
export const balanceInfo = `Наличными пополнить баланс можно в офисе или на базе( Строителей 100А) в рабочее время.
Можно пополнить баланс переводом (нажмите кнопку ниже), так же можно пополнить баланс, используя приложение Элемент Водитель`;

// Клавиатура для пополнения баланса
export const balanceAddKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Диспетчер', 'https://t.me/+79397245346')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для пополнения баланса
export const balanceAddInfo = `Номер карты для пополнения баланса
2202 2067 3099 5433

После перевода присылайте ФИО, номер авто и чек диспетчеру в телеграме (нажмите кнопку ниже)`;

// Клавиатура для вывода средств
export const balanceWithdrawKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Офис', 'https://t.me/yotaxi')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для вывода средств
export const balanceWithdrawInfo = `Вывод средств производится 24/7 через приложение Яндекс Про.`;

// Клавиатура для дальних поездок
export const longDistanceKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Меню', 'back_to_main')]
]);

// Текст для ссылок на группы
export const groupsInfo = `Выберите группу для перехода:`;

// Клавиатура для ссылок на группы
export const groupsKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Чат Центральный и Yotaxi', 'https://t.me/+Vh5NhM54_V2lgJBP')],
    [Markup.button.url('Розыгрыши здесь', 'https://t.me/yotaxi12')],
    [Markup.button.url('Машины под выкуп', 'https://t.me/+62DE0gWGFBFlYWEy')],
    [Markup.button.url('Помощь ТаксиЙо', 'https://t.me/+nFmk7sLJ-r41NmU6')],
    [Markup.button.callback('Меню', 'back_to_main')]
]);

/**
 * @file intent.ts
 * @description Типы и интерфейсы для системы определения намерений пользователя
 * @author garbulinandrey
 * @date 2025-06-06 14:30:36
 */

// Определение возможных интентов с подробными описаниями
export type RentalIntent = 
    | 'payment_methods'     // Способы оплаты аренды
    | 'payment_schedule'    // График списаний и платежей
    | 'car_return'         // Правила и процесс возврата автомобиля
    | 'penalties'          // Штрафы, нарушения и санкции
    | 'maintenance'        // Техническое обслуживание и уход
    | 'rental_rules'       // Общие правила аренды
    | 'office_hours'       // Часы работы офиса
    | 'geographical_rules' // Правила передвижения и географические ограничения
    | 'sick_leave'         // Оформление больничного
    | 'repair_rules'       // Правила ремонта и обслуживания
    | 'accident'           // Действия при ДТП
    | 'car_problem'        // Технические проблемы с автомобилем
    | 'balance_topup'      // Пополнение баланса
    | 'available_cars'     // Информация о доступных автомобилях
    | 'learning'           // Команды обучения бота
    | 'status'            // Проверка статуса системы
    | 'cached'            // Ответ из кэша
    | 'service'           // Сервисное обслуживание
    | 'car_question'      // Вопросы по автомобилю
    | 'dtp'              // ДТП (альтернативное название)
    | 'fine_check'       // Проверка штрафов
    | 'long_distance'    // Поездки на дальние расстояния
    | 'error';            // Ошибка обработки запроса

// Основной тип интента для использования в системе
export type Intent = RentalIntent;

/**
 * Интерфейс для примера интента
 * Используется для хранения обработанных сообщений пользователей
 */
export interface IntentExample {
    text: string;          // Текст сообщения
    intent: Intent;        // Определенный интент
    confidence: number;    // Уверенность в определении (0-1)
    confirmed: boolean;    // Подтверждено ли определение
    createdAt: Date;      // Дата создания примера
}

/**
 * Интерфейс для оценки интента
 * Используется при определении намерения пользователя
 */
export interface IntentScore {
    intent: Intent;        // Предполагаемый интент
    confidence: number;    // Уверенность в определении (0-1)
}

/**
 * Интерфейс для результата обучения
 * Используется для отслеживания успешности обучения
 */
export interface IntentLearningResult {
    success: boolean;      // Успешно ли прошло обучение
    error?: string;        // Описание ошибки, если она возникла
}

/**
 * Интерфейс для обучающего примера
 * Используется при добавлении новых примеров в базу знаний
 */
export interface TrainingExample {
    message: string;       // Сообщение пользователя
    response: string;      // Ответ системы
    intent: Intent;        // Правильный интент
}

/**
 * Интерфейс для статистики обучения
 * Используется для отслеживания качества работы системы
 */
export interface LearningStats {
    totalInteractions: number;                    // Общее количество взаимодействий
    positiveResponses: number;                    // Количество успешных ответов
    accuracyRate: number;                         // Точность определения интентов
    topIntents: Array<{ intent: Intent; count: number }>; // Популярные интенты
}

/**
 * Интерфейс для конфигурации определения интентов
 * Используется для настройки параметров системы
 */
export interface IntentDetectorConfig {
    minConfidence: number;         // Минимальный порог уверенности
    maxExamples: number;          // Максимальное количество примеров для обучения
    learningRate: number;         // Скорость обучения
    useCache: boolean;            // Использовать ли кэширование
}

/**
 * Интерфейс для ответа бота
 * Используется для структурирования ответов системы
 */
export interface TaxiResponse {
    intent: Intent;        // Определенный интент
    response: string;      // Текст ответа
    confidence?: number;   // Уверенность в ответе (опционально)
}
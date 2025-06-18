/**
 * @file openai.service.ts
 * @description Сервис для работы с OpenAI API и обработки запросов пользователей
 * @author garbulinandrey
 * @date 2025-06-06 15:50:07
 */

import { Configuration, OpenAIApi } from 'openai';
import { config } from '../config/config';
import { AdvancedIntentDetector } from './advanced-intent-detector.service';
import { IntentLearningService } from './intent-learning.service';
import { FeedbackCollector } from './feedback-collector.service';
import { CacheService } from './cache.service';
import { Intent, TaxiResponse, LearningStats } from '../types/intent';
import { logger } from '../utils/logger';

export class OpenAIService {
    private openai: OpenAIApi;
    private readonly systemPrompt: string;
    private intentDetector: AdvancedIntentDetector;
    private learningService: IntentLearningService;
    private feedbackCollector: FeedbackCollector;
    private cache: CacheService;
    private readonly defaultResponses: { [key in Intent]?: string };

    constructor() {
        const configuration = new Configuration({
            apiKey: config.OPENAI_API_KEY
        });
        this.openai = new OpenAIApi(configuration);
        
        this.intentDetector = new AdvancedIntentDetector();
        this.learningService = new IntentLearningService();
        this.feedbackCollector = new FeedbackCollector();
        this.cache = new CacheService();

        // Добавляем стандартные ответы для частых интентов
        this.defaultResponses = {
            fine_check: 'Посмотреть штрафы на автомобиле, Вы можете через приложение Элемент водитель или обратиться в офис (+79278835566)',
            error: 'Извините, произошла ошибка. Пожалуйста, попробуйте позже или позвоните нам: 7 927 883-55-66'
        };
        
        this.systemPrompt = `
Ты бот-помощник автопарка такси "Центральный". Твоя задача - помогать водителям и клиентам решать их вопросы.

ВАЖНЫЕ ПРАВИЛА:
1. Отвечай на все вопросы о доступных машинах и ценах
2. Не отправляй в офис при вопросах о наличии машин
3. Давай конкретную информацию о ценах
4. Используй только указанные контакты
5. Будь краток и конкретен

ДОСТУПНЫЕ АВТОМОБИЛИ И ЦЕНЫ:
При вопросах о наличии и ценах ВСЕГДА отвечай следующей информацией:
У нас в парке более 200 машин. Доступные варианты:
1. Лада Веста 2021 г. (МКПП) - 1700₽/сутки
2. Лада Веста 2023 г. (МКПП) - 2000₽/сутки
3. Солярис 2020-21 г. (АКПП) - 2000₽/сутки
4. Джетта 2023 г. (АКПП) - 2300₽/сутки
5. Солярис 2024 г. (АКПП) - 2600₽/сутки

КОНТАКТЫ И ОФИС:
- Общие вопросы: тел. 7 927 883-55-66
- График: Пн-Пт 9:00-19:00, Сб-Вс 10:00-17:00
- Тех. поддержка: тел. 7 929 734-45-55 (24/7)
- Проблемы с авто: тел. 7 937 936-00-19 (9:00-18:00)`;
    }

    /**
     * Получает ответ на сообщение пользователя
     */
    public async getResponse(message: string): Promise<TaxiResponse> {
        try {
            logger.info('Processing message:', { message });

            // Проверяем команду обучения
            const learningResponse = await this.handleLearningCommand(message);
            if (learningResponse) {
                return {
                    intent: 'learning',
                    response: learningResponse
                };
            }

            // Проверяем команду статуса
            if (message.trim().toLowerCase() === '/status') {
                const statusResponse = await this.checkLearningStatus();
                return {
                    intent: 'status',
                    response: statusResponse
                };
            }

            // Нормализуем входящее сообщение
            const normalizedMessage = this.normalizeMessage(message);

            // Проверяем кэш для точного соответствия
            const cachedResponse = await this.cache.get(normalizedMessage);
            if (cachedResponse) {
                logger.info('Cache hit (exact match):', { message: normalizedMessage });
                return {
                    intent: 'cached',
                    response: cachedResponse
                };
            }

            // Проверяем похожие вопросы в кэше
            const similarQuestion = await this.findSimilarCachedQuestion(normalizedMessage);
            if (similarQuestion) {
                const similarResponse = await this.cache.get(similarQuestion);
                if (similarResponse) {
                    logger.info('Cache hit (similar question):', { 
                        original: normalizedMessage, 
                        similar: similarQuestion 
                    });
                    
                    // Сохраняем новую вариацию в кэш
                    await this.cache.set(normalizedMessage, similarResponse);
                    
                    return {
                        intent: 'cached',
                        response: similarResponse
                    };
                }
            }

            // Определяем интент
            const intent = await this.intentDetector.detectIntent(message);
            logger.debug('Detected intent:', { intent });

            // Проверяем наличие стандартного ответа для интента
            if (this.defaultResponses[intent]) {
                const response = this.defaultResponses[intent]!;
                await this.cache.set(normalizedMessage, response);
                return {
                    intent,
                    response
                };
            }

            // Генерируем ответ с помощью OpenAI
            const completion = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo-16k",
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.3,
                max_tokens: 150
            });

            let response = completion.data.choices[0]?.message?.content || 
                        this.defaultResponses.error!;

            response = this.formatResponseText(response);
            
            // Сохраняем ответ в кэш и обучаем систему
            await this.cache.set(normalizedMessage, response);
            await this.learningService.learnFromInteraction(message, intent, true);
            await this.feedbackCollector.collectImplicitFeedback(message, response, intent);

            logger.info('Generated response:', { intent, response });

            return {
                intent,
                response,
                confidence: 0.9
            };
        } catch (error) {
            const e = error as Error;
            logger.error('Error in getResponse:', { error: e });
            return {
                intent: 'error',
                response: this.defaultResponses.error!
            };
        }
    }

    /**
     * Нормализует сообщение для поиска в кэше
     */
    private normalizeMessage(message: string): string {
        return message
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[?!.]+$/, '')
            .replace(/^(как|где|можно|ли|хочу|нужно|мне|надо)\s+/, '')
            .replace(/\s+(штрафы|штраф)/, ' штрафы')
            .replace(/^\s+|\s+$/g, '');
    }

    /**
     * Ищет похожие вопросы в кэше
     */
    private async findSimilarCachedQuestion(normalizedMessage: string): Promise<string | null> {
        try {
            const cachedKeys = await this.cache.getKeys();
            
            // Проверяем точное совпадение
            const exactMatch = cachedKeys.find(key => 
                this.normalizeMessage(key) === normalizedMessage
            );
            if (exactMatch) {
                logger.debug('Found exact match:', { normalizedMessage, match: exactMatch });
                return exactMatch;
            }

            // Проверяем ключевые слова для известных интентов
            const keywordMatches = {
                штраф: ['штраф', 'штрафы', 'штрафов'],
                машин: ['машин', 'машины', 'автомобил'],
                оплат: ['оплат', 'платеж', 'плат']
            };

            for (const [category, keywords] of Object.entries(keywordMatches)) {
                if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
                    const match = cachedKeys.find(key => 
                        keywords.some(kw => key.toLowerCase().includes(kw))
                    );
                    if (match) {
                        logger.debug('Found keyword match:', { 
                            normalizedMessage, 
                            category, 
                            match 
                        });
                        return match;
                    }
                }
            }

            // Проверяем частичные совпадения
            const words = normalizedMessage.split(' ').filter(w => w.length > 3);
            for (const key of cachedKeys) {
                const keyWords = this.normalizeMessage(key).split(' ');
                if (words.some(word => keyWords.includes(word))) {
                    logger.debug('Found partial match:', { normalizedMessage, match: key });
                    return key;
                }
            }

            logger.debug('No similar questions found:', { normalizedMessage });
            return null;

        } catch (error) {
            const e = error as Error;
            logger.error('Error finding similar question:', { error: e });
            return null;
        }
    }

    /**
     * Форматирует текст ответа
     */
    private formatResponseText(text: string): string {
        return text
            .replace(/(https?:\/\/[^\s]+)/g, '<$1>')
            .replace(/тел\. 7/g, 'тел. 7')
            .replace(/\\{2,}/g, '\\')
            .replace(/([^\\])\\/g, '$1')
            .trim();
    }

    /**
     * Обрабатывает команду обучения
     */
    private async handleLearningCommand(message: string): Promise<string> {
        const learnIndex = message.indexOf('/learn');
        if (learnIndex === -1) {
            return '';
        }

        try {
            logger.info('Processing learning command:', { message });
            
            const learningText = message.slice(learnIndex);
            const lines = learningText.split('\n');
            let question = '';
            let answer = '';
            let intent = '';
            let isCollectingAnswer = false;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (line.startsWith('Q:')) {
                    question = line.slice(2).trim();
                    isCollectingAnswer = false;
                } else if (line.startsWith('A:')) {
                    answer = line.slice(2).trim();
                    isCollectingAnswer = true;
                } else if (line.startsWith('T:')) {
                    intent = line.slice(2).trim();
                    isCollectingAnswer = false;
                } else if (isCollectingAnswer && trimmedLine) {
                    answer += '\n' + trimmedLine;
                }
            }

            if (!question || !answer || !intent) {
                return this.getLearningErrorMessage('missing_fields', { question, answer, intent });
            }

            if (!this.isValidIntent(intent)) {
                return this.getLearningErrorMessage('invalid_intent', { intent });
            }

            // Сохраняем основной вопрос
            await this.cache.set(question, answer);
            await this.learningService.learnFromInteraction(question, intent as Intent, true);

            // Генерируем и сохраняем вариации
            const variations = this.generateQuestionVariations(question);
            for (const variant of variations) {
                await this.cache.set(variant, answer);
                await this.learningService.learnFromInteraction(variant, intent as Intent, true);
                logger.debug('Saved variation:', { variant, intent });
            }

            return this.getLearningSuccessMessage({ 
                question, 
                answer, 
                intent, 
                variationsCount: variations.length 
            });

        } catch (error) {
            const e = error as Error;
            logger.error('Learning command error:', { error: e });
            return this.getLearningErrorMessage('processing_error', { error: e.message });
        }
    }

    /**
     * Генерирует вариации вопроса
     */
    private generateQuestionVariations(question: string): string[] {
        const baseForm = this.normalizeMessage(question);
        const variations = new Set<string>();

        // Базовые формы
        variations.add(question);
        variations.add(baseForm);
        variations.add(baseForm + '?');

        // Определяем тип вопроса по ключевым словам
        const questionTypes = {
            штрафы: ['штраф', 'штрафы', 'штрафов'],
            машины: ['машин', 'авто', 'автомобил'],
            оплата: ['оплат', 'плат', 'платеж'],
            работа: ['график', 'режим', 'работ'],
            проблемы: ['проблем', 'поломк', 'сломал']
        };

        let detectedType: string | null = null;
        for (const [type, keywords] of Object.entries(questionTypes)) {
            if (keywords.some(kw => baseForm.includes(kw))) {
                detectedType = type;
                break;
            }
        }

        if (detectedType) {
            // Добавляем специфические вариации для определенного типа вопроса
            const typeVariations = this.getTypeSpecificVariations(detectedType, baseForm);
            typeVariations.forEach(v => variations.add(v));
        }

        // Добавляем общие префиксы
        const prefixes = [
            'как', 'где', 'можно ли', 'хочу', 'нужно', 'подскажите', 
            'скажите', 'расскажите', 'объясните', 'помогите', 'надо',
            'мне нужно', 'я хочу', 'хотел бы', 'могу ли я'
        ];

        for (const prefix of prefixes) {
            variations.add(`${prefix} ${baseForm}`);
            variations.add(`${prefix} ${baseForm}?`);
        }

        return [...variations];
    }

    /**
     * Получает специфические вариации для типа вопроса
     */
    private getTypeSpecificVariations(type: string, baseForm: string): string[] {
        const variations = new Set<string>();
        
        const typeVariations: { [key: string]: string[] } = {
            штрафы: [
                'штрафы',
                'штраф',
                'посмотреть штрафы',
                'проверить штрафы',
                'узнать штрафы',
                'где штрафы',
                'как посмотреть штрафы',
                'где посмотреть штрафы',
                'можно посмотреть штрафы',
                'хочу посмотреть штрафы',
                'нужно посмотреть штрафы',
                'проверка штрафов'
            ],
            машины: [
                'машины в наличии',
                'доступные машины',
                'свободные автомобили',
                'какие машины есть',
                'автомобили в парке',
                'машины в парке',
                'есть ли машины'
            ],
            оплата: [
                'способы оплаты',
                'как оплатить',
                'варианты оплаты',
                'принимаете ли карты',
                'можно ли картой',
                'условия оплаты'
            ]
        };

        if (type in typeVariations) {
            typeVariations[type].forEach(v => variations.add(v));
        }

        return [...variations];
    }

    /**
     * Получает сообщение об ошибке обучения
     */
    private getLearningErrorMessage(type: 'missing_fields' | 'invalid_intent' | 'processing_error',
                                  details: any): string {
        const messages = {
            missing_fields: `❌ Ошибка: неправильный формат. Используйте:
/learn
Q: ваш вопрос
A: правильный ответ
T: тип_интента

Полученные значения:
Question: ${details.question || 'отсутствует'}
Answer: ${details.answer || 'отсутствует'}
Type: ${details.intent || 'отсутствует'}`,

            invalid_intent: `❌ Ошибка: неправильный тип интента "${details.intent}".
Используйте один из следующих типов:
- fine_check (штрафы)
- available_cars (доступные машины)
- payment_methods (способы оплаты)
- car_problem (проблемы с машиной)
- dtp (ДТП)
и другие...`,

            processing_error: `❌ Ошибка при обработке команды обучения: ${details.error}
Проверьте формат и попробуйте снова.`
        };

        return messages[type];
    }

    /**
     * Получает сообщение об успешном обучении
     */
    private getLearningSuccessMessage(details: {
        question: string;
        answer: string;
        intent: string;
        variationsCount: number;
    }): string {
        return `✅ Пример успешно добавлен!

📝 Детали:
Вопрос: ${details.question}
Ответ: ${details.answer}
Тип: ${details.intent}

🔄 Добавлено ${details.variationsCount} вариаций вопроса для лучшего распознавания.
Теперь я буду использовать эту информацию при ответах на похожие вопросы.`;
    }

    /**
     * Проверяет валидность интента
     */
    private isValidIntent(intent: string): intent is Intent {
        const validIntents: Array<Intent> = [
            'payment_methods',
            'payment_schedule',
            'car_return',
            'penalties',
            'maintenance',
            'rental_rules',
            'office_hours',
            'geographical_rules',
            'sick_leave',
            'repair_rules',
            'accident',
            'car_problem',
            'balance_topup',
            'available_cars',
            'learning',
            'status',
            'cached',
            'service',
            'car_question',
            'dtp',
            'fine_check',
            'long_distance',
            'error'
        ];
        return validIntents.includes(intent as Intent);
    }

    /**
     * Проверяет статус обучения
     */
    private async checkLearningStatus(): Promise<string> {
        try {
            const stats = await this.evaluateQuality();
            const cacheStats = await this.cache.getStats();

            return `📊 Статистика обучения:

Всего примеров: ${stats.totalInteractions}
Успешных ответов: ${stats.positiveResponses}
Точность: ${(stats.accuracyRate * 100).toFixed(1)}%

💾 Статистика кэша:
Записей: ${cacheStats.keys}
Попаданий: ${cacheStats.hits}
Промахов: ${cacheStats.misses}

🔝 Топ интентов:
${stats.topIntents.map(i => `- ${i.intent}: ${i.count} примеров`).join('\n')}`;
        } catch (error) {
            const e = error as Error;
            logger.error('Status check error:', { error: e });
            return `❌ Ошибка при получении статистики: ${e.message}`;
        }
    }

    /**
     * Оценивает качество работы системы
     */
    private async evaluateQuality(): Promise<LearningStats> {
        try {
            const stats = await this.learningService.getStats();
            return {
                totalInteractions: stats.total,
                positiveResponses: stats.confirmed,
                accuracyRate: stats.confirmed / Math.max(stats.total, 1),
                topIntents: [
                    { intent: 'available_cars', count: 30 },
                    { intent: 'payment_methods', count: 25 },
                    { intent: 'maintenance', count: 20 }
                ]
            };
        } catch (error) {
            const e = error as Error;
            logger.error('Failed to evaluate quality:', { error: e });
            throw error;
        }
    }
}
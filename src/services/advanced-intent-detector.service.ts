/**
 * @file advanced-intent-detector.service.ts
 * @description Сервис для продвинутого определения интентов с использованием ML
 * @author garbulinandrey
 * @date 2025-06-06 14:56:36
 */

import { IntentLearningService } from './intent-learning.service';
import { NLPProcessor } from '../utils/nlp-processor';
import { logger } from '../utils/logger';
import { Intent, IntentExample, IntentScore } from '../types/intent';

interface IntentRule {
    keywords: string[];
    patterns: RegExp[];
    contextTriggers: string[];
}

type IntentRules = {
    [K in Exclude<Intent, 'learning' | 'status' | 'cached' | 'error'>]: IntentRule;
};

export class AdvancedIntentDetector {
    private learningService: IntentLearningService;
    private nlpProcessor: NLPProcessor;

    private static readonly INTENT_RULES: IntentRules = {
        payment_methods: {
            keywords: [
                'оплата', 'платеж', 'карта', 'наличные', 'перевод',
                'способ', 'деньги', 'счет', 'банк'
            ],
            patterns: [
                /как (оплатить|заплатить)/i,
                /способы? оплаты/i,
                /чем (платить|оплатить)/i,
                /принимае(те|м) (оплату|карты)/i
            ],
            contextTriggers: ['платеж', 'транзакция', 'перевод']
        },
        payment_schedule: {
            keywords: [
                'график', 'расписание', 'списание', 'время', 'дата',
                'платеж', 'периодичность', 'регулярность'
            ],
            patterns: [
                /когда (списывают|платить)/i,
                /график (оплаты|платежей)/i,
                /частота списаний/i,
                /периодичность платежей/i
            ],
            contextTriggers: ['число', 'месяц', 'период', 'дата']
        },
        car_return: {
            keywords: [
                'вернуть', 'возврат', 'сдать', 'сдача', 'завершить',
                'закончить', 'аренда', 'прекратить'
            ],
            patterns: [
                /как (вернуть|сдать) (машину|автомобиль)/i,
                /правила (возврата|сдачи)/i,
                /где (вернуть|сдать)/i,
                /когда (вернуть|сдать)/i
            ],
            contextTriggers: ['место', 'время', 'адрес', 'пункт']
        },
        penalties: {
            keywords: [
                'штраф', 'нарушение', 'пени', 'санкции', 'наказание',
                'взыскание', 'задолженность'
            ],
            patterns: [
                /получил штраф/i,
                /есть ли штрафы/i,
                /проверить (штрафы|нарушения)/i,
                /что будет (за|если)/i
            ],
            contextTriggers: ['нарушение', 'правила', 'оплата']
        },
        maintenance: {
            keywords: [
                'то', 'обслуживание', 'проверка', 'диагностика',
                'осмотр', 'техосмотр', 'сервис'
            ],
            patterns: [
                /техническое обслуживание/i,
                /когда (то|обслуживание)/i,
                /нужно ли (то|обслуживание)/i,
                /правила обслуживания/i
            ],
            contextTriggers: ['масло', 'фильтр', 'колеса', 'тормоза']
        },
        rental_rules: {
            keywords: [
                'правила', 'условия', 'требования', 'ограничения',
                'запрет', 'разрешение', 'можно', 'нельзя'
            ],
            patterns: [
                /какие правила/i,
                /что (можно|нельзя)/i,
                /правила (использования|аренды)/i,
                /условия (аренды|использования)/i
            ],
            contextTriggers: ['документ', 'договор', 'соглашение']
        },
        office_hours: {
            keywords: [
                'график', 'время', 'часы', 'работа', 'открыто',
                'закрыто', 'перерыв', 'обед'
            ],
            patterns: [
                /когда (работает|открыто)/i,
                /часы работы/i,
                /время работы/i,
                /график работы/i
            ],
            contextTriggers: ['офис', 'филиал', 'отделение']
        },
        geographical_rules: {
            keywords: [
                'зона', 'территория', 'город', 'область', 'регион',
                'граница', 'выезд', 'передвижение'
            ],
            patterns: [
                /где можно ездить/i,
                /зона (использования|поездок)/i,
                /можно ли выехать/i,
                /территория (использования|обслуживания)/i
            ],
            contextTriggers: ['карта', 'маршрут', 'расстояние']
        },
        sick_leave: {
            keywords: [
                'больничный', 'болезнь', 'заболел', 'врач',
                'недомогание', 'плохо', 'здоровье'
            ],
            patterns: [
                /как оформить больничный/i,
                /заболел, что делать/i,
                /если заболею/i,
                /плохо себя чувствую/i
            ],
            contextTriggers: ['справка', 'документ', 'медицинский']
        },
        repair_rules: {
            keywords: [
                'ремонт', 'поломка', 'починка', 'сервис',
                'мастерская', 'запчасти', 'детали'
            ],
            patterns: [
                /как (починить|отремонтировать)/i,
                /правила ремонта/i,
                /где (чинить|ремонтировать)/i,
                /поломалась машина/i
            ],
            contextTriggers: ['сервис', 'мастер', 'механик']
        },
        accident: {
            keywords: [
                'дтп', 'авария', 'столкновение', 'происшествие',
                'удар', 'повреждение', 'царапина'
            ],
            patterns: [
                /что делать при дтп/i,
                /попал в аварию/i,
                /случилось дтп/i,
                /пдд нарушение/i
            ],
            contextTriggers: ['страховка', 'полиция', 'гибдд']
        },
        car_problem: {
            keywords: [
                'проблема', 'неисправность', 'поломка', 'сломалась',
                'не работает', 'не заводится'
            ],
            patterns: [
                /машина сломалась/i,
                /проблема с автомобилем/i,
                /не работает/i,
                /что делать если/i
            ],
            contextTriggers: ['стук', 'шум', 'вибрация', 'течь']
        },
        balance_topup: {
            keywords: [
                'пополнить', 'баланс', 'деньги', 'счет',
                'оплата', 'перевод', 'внести'
            ],
            patterns: [
                /как пополнить/i,
                /пополнение баланса/i,
                /внести деньги/i,
                /способы пополнения/i
            ],
            contextTriggers: ['карта', 'банк', 'терминал']
        },
        available_cars: {
            keywords: [
                'машины', 'автомобили', 'доступно', 'свободно',
                'варианты', 'выбор', 'модели'
            ],
            patterns: [
                /какие машины есть/i,
                /доступные автомобили/i,
                /что есть в наличии/i,
                /свободные машины/i
            ],
            contextTriggers: ['цена', 'стоимость', 'тариф']
        },
        service: {
            keywords: [
                'сервис', 'обслуживание', 'ремонт', 'то',
                'диагностика', 'проверка', 'осмотр'
            ],
            patterns: [
                /записаться на сервис/i,
                /нужно обслуживание/i,
                /проверить машину/i,
                /записать на то/i
            ],
            contextTriggers: ['механик', 'мастер', 'станция']
        },
        car_question: {
            keywords: [
                'вопрос', 'машина', 'автомобиль', 'характеристики',
                'особенности', 'комплектация', 'информация'
            ],
            patterns: [
                /расскажите про (машину|автомобиль)/i,
                /какая машина/i,
                /что за автомобиль/i,
                /характеристики авто/i
            ],
            contextTriggers: ['модель', 'марка', 'год', 'двигатель']
        },
        dtp: {
            keywords: [
                'дтп', 'авария', 'столкновение', 'удар', 'гибдд',
                'страховка', 'происшествие', 'повреждение'
            ],
            patterns: [
                /попал в (дтп|аварию)/i,
                /меня (стукнули|подбили)/i,
                /(случилось|произошло) дтп/i,
                /что делать при (дтп|аварии)/i
            ],
            contextTriggers: ['царапина', 'вмятина', 'разбил', 'помял']
        },
        fine_check: {
            keywords: [
                'штраф', 'нарушение', 'проверка', 'гибдд',
                'камера', 'пдд', 'оплата', 'квитанция'
            ],
            patterns: [
                /проверить штрафы?/i,
                /есть ли штрафы?/i,
                /как (оплатить|проверить) штраф/i,
                /где посмотреть штрафы/i
            ],
            contextTriggers: ['постановление', 'нарушение', 'камера']
        },
        long_distance: {
            keywords: [
                'поездка', 'дальняя', 'межгород', 'расстояние',
                'километраж', 'маршрут', 'путь'
            ],
            patterns: [
                /дальняя поездка/i,
                /выезд (в|за) город/i,
                /межгород(няя|нее)/i,
                /поездка в другой город/i
            ],
            contextTriggers: ['километр', 'регион', 'область', 'граница']
        }
    };

    constructor() {
        this.learningService = new IntentLearningService();
        this.nlpProcessor = new NLPProcessor();
    }

    /**
     * Определяет intent на основе текста сообщения
     */
    public async detectIntent(text: string): Promise<Intent> {
        try {
            const normalizedText = await this.nlpProcessor.normalize(text);
            const scores = await this.calculateIntentScores(normalizedText);
            const topIntent = scores.sort((a, b) => b.confidence - a.confidence)[0];

            if (topIntent.confidence >= 0.7) {
                await this.learningService.learnFromInteraction(text, topIntent.intent, true);
                return topIntent.intent;
            }

            const similarExamples = await this.learningService.getSimilarExamples(text);
            if (similarExamples.length > 0) {
                const historicalIntent = this.getMostFrequentIntent(similarExamples);
                await this.learningService.learnFromInteraction(text, historicalIntent, true);
                return historicalIntent;
            }

            return 'error';
        } catch (error) {
            const e = error as Error;
            logger.error('Error detecting intent:', { error: e });
            return 'error';
        }
    }

    /**
     * Рассчитывает оценки для каждого интента
     */
    private async calculateIntentScores(text: string): Promise<IntentScore[]> {
        const tokens = await this.nlpProcessor.tokenize(text);
        const scores: IntentScore[] = [];

        for (const [intentKey, rules] of Object.entries(AdvancedIntentDetector.INTENT_RULES)) {
            let score = 0;
            const intent = intentKey as Intent;

            const keywordScore = this.calculateKeywordMatch(tokens, rules.keywords);
            score += keywordScore * 0.4;

            const patternScore = this.calculatePatternMatch(text, rules.patterns);
            score += patternScore * 0.4;

            const contextScore = this.calculateContextMatch(tokens, rules.contextTriggers);
            score += contextScore * 0.2;

            scores.push({
                intent,
                confidence: score
            });
        }

        return scores;
    }

    /**
     * Рассчитывает совпадение по ключевым словам
     */
    private calculateKeywordMatch(tokens: string[], keywords: string[]): number {
        const matches = tokens.filter(token => 
            keywords.some(keyword => token.toLowerCase().includes(keyword.toLowerCase()))
        );
        return matches.length / Math.max(keywords.length, 1);
    }

    /**
     * Рассчитывает совпадение по регулярным выражениям
     */
    private calculatePatternMatch(text: string, patterns: RegExp[]): number {
        const matches = patterns.filter(pattern => pattern.test(text));
        return matches.length / Math.max(patterns.length, 1);
    }

    /**
     * Рассчитывает совпадение по контекстным триггерам
     */
    private calculateContextMatch(tokens: string[], triggers: string[]): number {
        const matches = tokens.filter(token =>
            triggers.some(trigger => token.toLowerCase().includes(trigger.toLowerCase()))
        );
        return matches.length / Math.max(triggers.length, 1);
    }

    /**
     * Определяет наиболее частый intent из примеров
     */
    private getMostFrequentIntent(examples: IntentExample[]): Intent {
        const intentCounts = examples.reduce((acc, example) => {
            acc[example.intent] = (acc[example.intent] || 0) + 1;
            return acc;
        }, {} as Record<Intent, number>);

        return Object.entries(intentCounts)
            .sort(([, a], [, b]) => b - a)[0][0] as Intent;
    }

    /**
     * Обновляет правила для интента
     */
    public async updateIntentRules(
        intent: Intent,
        newRules: Partial<IntentRule>
    ): Promise<void> {
        try {
            const ruleKey = intent as keyof typeof AdvancedIntentDetector.INTENT_RULES;
            if (ruleKey in AdvancedIntentDetector.INTENT_RULES) {
                const currentRules = AdvancedIntentDetector.INTENT_RULES[ruleKey];
                
                if (newRules.keywords) {
                    currentRules.keywords = [...new Set([...currentRules.keywords, ...newRules.keywords])];
                }
                if (newRules.patterns) {
                    currentRules.patterns = [...new Set([...currentRules.patterns, ...newRules.patterns])];
                }
                if (newRules.contextTriggers) {
                    currentRules.contextTriggers = [...new Set([...currentRules.contextTriggers, ...newRules.contextTriggers])];
                }
            }
        } catch (error) {
            const e = error as Error;
            logger.error('Error updating intent rules:', { error: e });
            throw error;
        }
    }
}
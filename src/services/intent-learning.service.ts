/**
 * @file intent-learning.service.ts
 * @description Сервис для обучения системы определения интентов
 * @author garbulinandrey
 * @date 2025-06-06 14:52:20
 */

import { Intent, IntentExample, IntentLearningResult } from '../types/intent';
import { logger } from '../utils/logger';

export class IntentLearningService {
    private examples: IntentExample[] = [];
    private readonly MAX_EXAMPLES = 1000;

    /**
     * Обучение на основе взаимодействия
     */
    public async learnFromInteraction(
        text: string,
        intent: Intent,
        isConfirmed: boolean
    ): Promise<IntentLearningResult> {
        try {
            const example: IntentExample = {
                text,
                intent,
                confidence: isConfirmed ? 1 : 0.5,
                confirmed: isConfirmed,
                createdAt: new Date()
            };

            this.examples.push(example);
            
            // Ограничиваем количество примеров
            if (this.examples.length > this.MAX_EXAMPLES) {
                this.examples = this.examples
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, this.MAX_EXAMPLES);
            }

            logger.info('Added new learning example:', { text, intent, isConfirmed });
            return { success: true };
        } catch (error) {
            const e = error as Error;
            logger.error('Error learning from interaction:', { error: e });
            return { success: false, error: e.message };
        }
    }

    /**
     * Анализ негативной обратной связи
     */
    public async analyzeNegativeFeedback(
        text: string,
        incorrectIntent: Intent
    ): Promise<IntentLearningResult> {
        try {
            // Находим и удаляем неправильные примеры
            this.examples = this.examples.filter(example => 
                !(example.text === text && example.intent === incorrectIntent)
            );

            logger.info('Processed negative feedback:', { text, incorrectIntent });
            return { success: true };
        } catch (error) {
            const e = error as Error;
            logger.error('Error analyzing negative feedback:', { error: e });
            return { success: false, error: e.message };
        }
    }

    /**
     * Получение похожих примеров
     */
    public async getSimilarExamples(text: string): Promise<IntentExample[]> {
        return this.examples
            .filter(example => this.calculateSimilarity(text, example.text) > 0.7)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }

    /**
     * Расчет схожести текстов
     */
    private calculateSimilarity(text1: string, text2: string): number {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Получение статистики обучения
     */
    public getStats(): { total: number; confirmed: number } {
        return {
            total: this.examples.length,
            confirmed: this.examples.filter(e => e.confirmed).length
        };
    }
}
/**
 * @file cache.service.ts
 * @description Сервис для кэширования ответов бота
 * @author garbulinandrey
 * @date 2025-06-06 15:32:21
 */

import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

export class CacheService {
    private cache: NodeCache;
    
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 24 * 60 * 60, // 24 часа
            checkperiod: 60 * 60,  // проверка каждый час
            useClones: false
        });

        this.cache.on('expired', (key: string) => {
            logger.info('Cache entry expired:', { key });
        });
    }

    /**
     * Нормализует ключ для кэша
     */
private normalizeKey(key: string): string {
    return key
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[?!.]+$/, '')
        .replace(/^(как|где|можно|ли|хочу|нужно|мне|надо)\s+/, '')
        .replace(/\s+(штрафы|штраф)/, ' штрафы')  // нормализация окончаний
        .replace(/^\s+|\s+$/g, '');
}

    /**
     * Сохраняет значение в кэш
     */
    public async set(key: string, value: string): Promise<void> {
        try {
            const normalizedKey = this.normalizeKey(key);
            await this.cache.set(normalizedKey, value);
            logger.debug('Cache set:', { key: normalizedKey, value });
        } catch (error) {
            const e = error as Error;
            logger.error('Cache set error:', { error: e });
        }
    }

    /**
     * Получает значение из кэша
     */
    public async get(key: string): Promise<string | null> {
        try {
            const normalizedKey = this.normalizeKey(key);
            const value = await this.cache.get<string>(normalizedKey);
            
            if (value) {
                logger.debug('Cache hit:', { key: normalizedKey, value });
                return value;
            }
            
            logger.debug('Cache miss:', { key: normalizedKey });
            return null;
        } catch (error) {
            const e = error as Error;
            logger.error('Cache get error:', { error: e });
            return null;
        }
    }

    /**
     * Удаляет значение из кэша
     */
    public async delete(key: string): Promise<void> {
        try {
            const normalizedKey = this.normalizeKey(key);
            await this.cache.del(normalizedKey);
            logger.debug('Cache delete:', { key: normalizedKey });
        } catch (error) {
            const e = error as Error;
            logger.error('Cache delete error:', { error: e });
        }
    }

    /**
     * Очищает весь кэш
     */
    public async clear(): Promise<void> {
        try {
            await this.cache.flushAll();
            logger.info('Cache cleared');
        } catch (error) {
            const e = error as Error;
            logger.error('Cache clear error:', { error: e });
        }
    }

    /**
     * Получает все ключи из кэша
     */
    public async getKeys(): Promise<string[]> {
        return this.cache.keys();
    }

    /**
     * Получает статистику кэша
     */
    public async getStats(): Promise<{
        keys: number;
        hits: number;
        misses: number;
        ksize: number;
        vsize: number;
    }> {
        return this.cache.getStats();
    }
}
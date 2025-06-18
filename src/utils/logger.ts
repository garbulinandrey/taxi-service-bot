/**
 * @file logger.ts
 * @description Утилита для логирования
 * @author garbulinandrey
 * @date 2025-06-06 14:43:22
 */

export class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = this.getTimestamp();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }

    info(message: string, meta?: any): void {
        console.log(this.formatMessage('INFO', message, meta));
    }

    debug(message: string, meta?: any): void {
        console.debug(this.formatMessage('DEBUG', message, meta));
    }

    warn(message: string, meta?: any): void {
        console.warn(this.formatMessage('WARN', message, meta));
    }

    error(message: string, meta?: any): void {
        console.error(this.formatMessage('ERROR', message, meta));
    }
}

export const logger = new Logger();
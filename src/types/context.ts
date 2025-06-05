import { Context } from 'telegraf';

export interface SessionData {
    messageId?: number;
    isPhotoMessage?: boolean;
}

export interface MyContext extends Context {
    session: SessionData;
}
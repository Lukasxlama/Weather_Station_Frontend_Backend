import { InjectionToken } from '@angular/core';

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerConfig
{
    level: LogLevel;
    withTimestamp?: boolean;
    withColors?: boolean;
    remoteHook?: (level: LogLevel, ctx: string, message: any[], extra?: any) => void;
}

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');
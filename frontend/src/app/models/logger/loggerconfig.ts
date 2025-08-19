import { LogLevel } from "./loglevel";

export interface LoggerConfig
{
    level: LogLevel;
    withTimestamp?: boolean;
    withColors?: boolean;
    remoteHook?: (level: LogLevel, ctx: string, message: any[], extra?: any) => void;
}
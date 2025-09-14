import type { LogLevelType } from "@app/models/logger/loglevel";

export interface LoggerConfigModel
{
    level: LogLevelType;
    withTimestamp?: boolean;
    withColors?: boolean;
    remoteHook?: (level: LogLevelType, ctx: string, message: any[], extra?: any) => void;
}
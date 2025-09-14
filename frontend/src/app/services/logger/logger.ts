import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import type { LoggerConfigModel } from '@app/models/logger/loggerconfig';
import type { LogLevelType } from '@app/models/logger/loglevel';
import { environment } from '@env/environment';
const LEVELS: LogLevelType[] = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];

@Injectable({ providedIn: 'root' })
export class LoggerService
{
  private config: LoggerConfigModel;

  constructor()
  {
    this.config =
    {
      level: environment.logLevel as LogLevelType,
      withTimestamp: true,
      withColors: true
    };
  }

  // --- Public logging methods ---
  trace(...msg: any[]) { this.log('trace', 'app', msg); }
  debug(...msg: any[]) { this.log('debug', 'app', msg); }
  info(...msg: any[]) { this.log('info', 'app', msg); }
  warn(...msg: any[]) { this.log('warn', 'app', msg); }
  error(...msg: any[]) { this.log('error', 'app', msg); }

  withContext(ctx: string)
  {
    return (
      {
        trace: (...msg: any[]) => this.log('trace', ctx, msg),
        debug: (...msg: any[]) => this.log('debug', ctx, msg),
        info: (...msg: any[]) => this.log('info', ctx, msg),
        warn: (...msg: any[]) => this.log('warn', ctx, msg),
        error: (...msg: any[]) => this.log('error', ctx, msg),
      }
    );
  }

  logHttpError(ctx: string, err: unknown, note?: string)
  {
    const payload = this.normalizeError(err);
    this.log('error', ctx, [note ?? 'HTTP error', payload]);
  }

  // --- Core logging logic ---
  private log(level: LogLevelType, ctx: string, message: any[])
  {
    if (LEVELS.indexOf(level) > LEVELS.indexOf(this.config.level)) return;

    const timestamp = this.config.withTimestamp ? this.timestamp() : '';
    const head = `[${ctx}]${timestamp ? ' ' + timestamp : ''}`;

    const fn =
      level === 'error' ? console.error :
        level === 'warn' ? console.warn :
          level === 'info' ? console.info :
            level === 'debug' ? console.debug : console.trace;

    if (this.config.withColors)
    {
      fn(`%c${head}%c`, this.style(level), 'color:inherit', ...message);
    }
    
    else
    {
      fn(head, ...message);
    }

    if (this.config.remoteHook)
    {
      try { this.config.remoteHook(level, ctx, message); } catch { /* ignore */ }
    }
  }

  // --- Helpers ---
  private timestamp()
  {
    return new Date().toISOString().split('T')[1].replace('Z', '');
  }

  private style(level: LogLevelType): string
  {
    switch (level)
    {
      case 'trace': return 'color:#9aa0a6';
      case 'debug': return 'color:#8ab4f8';
      case 'info': return 'color:#34a853';
      case 'warn': return 'color:#fbbc04';
      case 'error': return 'color:#ea4335;font-weight:600';
      default: return 'color:inherit';
    }
  }

  private normalizeError(err: unknown)
  {
    if (err instanceof HttpErrorResponse)
    {
      return { status: err.status, url: err.url, message: err.message, error: err.error };
    }

    if (err instanceof Error)
    {
      return { name: err.name, message: err.message, stack: err.stack };
    }

    return err;
  }
}
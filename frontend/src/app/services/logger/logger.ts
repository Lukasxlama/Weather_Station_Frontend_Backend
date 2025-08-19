import { Inject, Injectable, Optional } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LOGGER_CONFIG, LoggerConfig, LogLevel } from './logger.config';

const LEVEL_ORDER: LogLevel[] = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];

@Injectable({ providedIn: 'root' })
export class LoggerService
{
  private loggerConfig: LoggerConfig;

  constructor(@Optional() @Inject(LOGGER_CONFIG) loggerConfig?: LoggerConfig)
  {
    this.loggerConfig =
    {
      level: 'info',
      withTimestamp: true,
      withColors: true,
      ...loggerConfig
    };
  }

  withContext(ctx: string): ScopedLogger
  {
    return new ScopedLogger(this.loggerConfig, ctx);
  }

  setLevel(level: LogLevel)
  {
    this.loggerConfig.level = level;
  }

  trace(...msg: any[]) { this._log('trace', 'app', msg); }
  debug(...msg: any[]) { this._log('debug', 'app', msg); }
  info(...msg: any[]) { this._log('info', 'app', msg); }
  warn(...msg: any[]) { this._log('warn', 'app', msg); }
  error(...msg: any[]) { this._log('error', 'app', msg); }

  logHttpError(ctx: string, err: unknown, note?: string)
  {
    const payload = this._normalizeError(err);
    this._log('error', ctx, [note ?? 'HTTP error', payload]);
  }

  private _log(level: LogLevel, ctx: string, message: any[], extra?: any)
  {
    if (LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(this.loggerConfig.level)) return;

    const ts = this.loggerConfig.withTimestamp ? this._ts() : '';
    const head = `[${ctx}]${ts ? ' ' + ts : ''}`;

    const fn =
      level === 'error' ? console.error :
        level === 'warn' ? console.warn :
          level === 'info' ? console.info :
            level === 'debug' ? console.debug : console.trace;

    if (this.loggerConfig.withColors)
    {
      const style = this._styleFor(level);
      fn(`%c${head}%c`, style, 'color:inherit', ...message);
    }

    else
    {
      fn(head, ...message);
    }

    if (this.loggerConfig.remoteHook)
    {
      try { this.loggerConfig.remoteHook(level, ctx, message, extra); } catch { /* ignore */ }
    }
  }

  private _ts()
  {
    const d = new Date();
    const pad = (n: number, s = 2) => n.toString().padStart(s, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }

  private _styleFor(level: LogLevel): string
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

  private _normalizeError(err: unknown)
  {
    if (err instanceof HttpErrorResponse)
    {
      return {
        status: err.status,
        statusText: err.statusText,
        url: err.url,
        message: err.message,
        error: err.error
      };
    }

    if (err instanceof Error)
    {
      return { name: err.name, message: err.message, stack: err.stack };
    }

    return err;
  }
}

/** A context-bound logger returned by LoggerService.withContext('Feature'). */
export class ScopedLogger
{
  constructor(private loggerConfig: LoggerConfig, private ctx: string) {}

  trace(...msg: any[]) { this._log('trace', msg); }
  debug(...msg: any[]) { this._log('debug', msg); }
  info(...msg: any[]) { this._log('info', msg); }
  warn(...msg: any[]) { this._log('warn', msg); }
  error(...msg: any[]) { this._log('error', msg); }

  time<T>(label: string): () => void
  {
    const start = performance.now();
    return () =>
    {
      const ms = (performance.now() - start).toFixed(1);
      this.debug(`${label} ${ms}ms`);
    };
  }

  private _log(level: LogLevel, message: any[])
  {
    // reuse LoggerService logic via a tiny inline
    const service = new LoggerService(this.loggerConfig as any);
    (service as any)._log(level, this.ctx, message);
  }
}
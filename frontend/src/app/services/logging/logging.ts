import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LoggerService
{
  info(msg: string) { console.debug('[DebugService]', msg); }
  error(msg: string, err?: any) { console.error('[DebugService]', msg, err); }
}
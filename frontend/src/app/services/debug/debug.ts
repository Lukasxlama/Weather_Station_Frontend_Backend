import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { LoggerService } from '../logger/logger';
import { ReceivedPacket } from '../../models/shared/receivedpacket';
import { HttpService } from '../http/http';

@Injectable({ providedIn: 'root' })
export class DebugService
{
  private readonly log;

  constructor(
    private httpService: HttpService,
    private loggerService: LoggerService
  )
  {
    this.log = this.loggerService.withContext('DebugService');
  }

  runQuery(sql: string): Observable<ReceivedPacket[]>
  {
    const started = performance.now();
    this.log.info('runQuery: starting');

    return this.httpService.post<ReceivedPacket[]>('/debug/sql', { sql }).pipe(
      tap((rows) =>
        {
          this.log.info(`runQuery OK: ${rows?.length ?? 0} rows`);
        }
      ),

      catchError((err) =>
        {
          this.log.error('runQuery failed', err);
          return throwError(() => err);
        }
      ),

      finalize(() =>
        {
          const ms = (performance.now() - started).toFixed(2);
          this.log.info(`runQuery finished in ${ms} ms`);
        }
      )
    );
  }
}

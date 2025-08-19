import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { LoggerService } from '../logger/logger';
import { ReceivedPacket } from '../../models/receivedpacket';

@Injectable({ providedIn: 'root' })
export class DebugService
{
  constructor( private http: HttpClient, private logger: LoggerService) {}

  runQuery(sql: string): Observable<ReceivedPacket[]>
  {
    const startTime = performance.now();
    this.logger.info(`runQuery: Starting SQL query`);

    return this.http.post<any[]>('/api/debug/sql', { sql }).pipe(
      finalize(() =>
      {
        const duration = performance.now() - startTime;
        this.logger.info(`runQuery completed in ${duration.toFixed(2)} ms`);
      }),

      tap(rows =>
      {
        const duration = Date.now() - startTime;
        this.logger.info(`runQuery succeeded: Retrieved ${rows.length} {rows}`);
      }),

      catchError((err: HttpErrorResponse) =>
      {
        this.logger.error(`runQuery failed (status ${err.status ?? 'unknown'}): ${err.message}`);
        return throwError(() => err);
      })
    );
  }
}

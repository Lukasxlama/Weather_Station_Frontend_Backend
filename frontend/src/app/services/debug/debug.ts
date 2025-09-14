import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { LoggerService } from '@app/services/logger/logger';
import type { ReceivedPacketModel } from '@app/models/shared/receivedpacket';
import { HttpService } from '@app/services/http/http';
import { API_ENDPOINTS } from '@env/api-endpoints';

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

  runQuery(sql: string): Observable<ReceivedPacketModel[]>
  {
    const started = performance.now();
    this.log.info('runQuery: starting');

    return this.httpService.post<ReceivedPacketModel[]>(API_ENDPOINTS.debug, { sql }).pipe(
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

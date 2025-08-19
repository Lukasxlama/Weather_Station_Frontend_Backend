import { Injectable } from '@angular/core';
import { Observable, timer, switchMap } from 'rxjs';
import { ReceivedPacket } from '../../models/shared/receivedpacket';
import { LoggerService } from '../logger/logger';
import { HttpService } from '../http/http';

@Injectable({ providedIn: 'root' })
export class LatestService
{
  private readonly log;

  constructor(
    private httpService: HttpService,
    private loggerService: LoggerService
  )
  {
    this.log = this.loggerService.withContext('LatestService');
  }

  getLatestPacket(): Observable<ReceivedPacket>
  {
    this.log.debug('Requesting latest packet...');
    return this.httpService.get<ReceivedPacket>('latest');
  }

  pollLatestPacket(intervalMs = 5000): Observable<ReceivedPacket>
  {
    this.log.info(`Starting polling every ${intervalMs}ms`);
    return timer(0, intervalMs).pipe(
      switchMap(() => 
      {
        this.log.trace('Polling tick → fetching latest packet');
        return this.getLatestPacket();
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Observable, timer, switchMap } from 'rxjs';
import type { ReceivedPacketModel } from '@app/models/shared/receivedpacket';
import { LoggerService } from '@app/services/logger/logger';
import { HttpService } from '@app/services/http/http';
import { API_ENDPOINTS } from '@env/api-endpoints';

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

  getLatestPacket(): Observable<ReceivedPacketModel>
  {
    this.log.debug('Requesting latest packet...');
    return this.httpService.get<ReceivedPacketModel>(API_ENDPOINTS.latest);
  }

  pollLatestPacket(intervalMs = 5000): Observable<ReceivedPacketModel>
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

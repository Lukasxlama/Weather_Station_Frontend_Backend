import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { TrendsResponseModel } from '@app/models/trends/trendsresponse';
import { HttpService } from '@app/services/http/http';
import { LoggerService } from '@app/services/logger/logger';
import { API_ENDPOINTS } from '@env/api-endpoints';

@Injectable({ providedIn: 'root' })
export class TrendsService
{
  private readonly log;

  constructor(
    private httpService: HttpService,
    private loggerService: LoggerService
  )
  {
    this.log = this.loggerService.withContext('TrendsService');
  }

  getRange(fromISO: string, toISO: string): Observable<TrendsResponseModel>
  {
    this.log.debug(`Getting data from ${fromISO} to ${toISO}`)
    const httpParams = new HttpParams().set('from', fromISO).set('to', toISO);
    return this.httpService.get<TrendsResponseModel>(API_ENDPOINTS.trends, { params: httpParams });
  }
}

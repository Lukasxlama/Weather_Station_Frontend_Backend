import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrendsResponse } from '../../models/trends/trendsresponse';
import { HttpService } from '../http/http';
import { LoggerService } from '../logger/logger';

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

  getRange(fromISO: string, toISO: string): Observable<TrendsResponse>
  {
    const httpParams = new HttpParams().set('from', fromISO).set('to', toISO);
    return this.httpService.get<TrendsResponse>("trends", { params: httpParams });
  }
}

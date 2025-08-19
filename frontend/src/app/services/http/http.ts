import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { LoggerService } from '../logger/logger';
import { catchError, map, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService
{
  private readonly log;

  constructor(
    private readonly http: HttpClient,
    private readonly loggerService: LoggerService
  )
  {
    this.log = this.loggerService.withContext('HttpService');
  }

  private buildUrl(endpoint: string, absolute = false): string
  {
    if (absolute) return endpoint;
    return `api/${endpoint.replace(/^\/+/, '')}`;
  }

  get<T>(endpoint: string, options: { params?: HttpParams, absolute?: boolean} = {})
  {
    const url = this.buildUrl(endpoint, options.absolute ?? false);
    this.log.debug('GET', url, options.params?.toString() ?? '');

    return this.http.get<T>(url, { params: options.params }).pipe(
      map((res) => 
      {
        this.log.debug('Response:', res);
        return res;
      }),

      catchError((err: HttpErrorResponse) =>
      {
        this.loggerService.logHttpError('HttpService', err, `GET ${url} failed`);
        return throwError(() => err);
      })
    );
  }

  post<T>(endpoint: string, body: unknown, options: { params?: HttpParams, absolute?: boolean} = {})
  {
    const url = this.buildUrl(endpoint, options.absolute ?? false);
    this.log.debug('POST', url, body);

    return this.http.post<T>(url, body, { params: options.params }).pipe(
      map((res) =>
      {
        this.log.debug('Response:', res);
        return res;
      }),

      catchError((err: HttpErrorResponse) =>
      {
        this.loggerService.logHttpError('HttpService', err, `POST ${url} failed`);
        return throwError(() => err);
      })
    );
  }
}

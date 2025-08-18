// src/app/services/trend/trend.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrendSeries {
  temperature: { t: string; v: number }[];
  humidity: { t: string; v: number }[];
  pressure: { t: string; v: number }[];
  gas_resistance: { t: string; v: number }[];
}

export interface TrendResponse {
  bucket_seconds: number;
  from: string;
  to: string;
  series: TrendSeries;
}

@Injectable({ providedIn: 'root' })
export class TrendService {
  private readonly base = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getRange(fromISO: string, toISO: string): Observable<TrendResponse> {
    const params = new HttpParams().set('from', fromISO).set('to', toISO);
    return this.http.get<TrendResponse>(`${this.base}/trends`, { params });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService
{
  private config: any;

  constructor(private http: HttpClient) {}

  async load(): Promise<any>
  {
    const config = await firstValueFrom(this.http.get('/assets/config.json'));
    this.config = config;
    return config;
  }

  get apiBaseUrl() { return this.config.apiBaseUrl; }
  get logLevel() { return this.config.logLevel; }
}

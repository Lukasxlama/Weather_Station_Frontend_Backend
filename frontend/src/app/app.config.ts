import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { LOGGER_CONFIG } from './services/logger/logger.config';
import { ConfigService } from './services/config/config';

function initAppConfig(config: ConfigService) { return () => config.load(); }

export const appConfig: ApplicationConfig =
{
  providers:
  [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    {
      provide: LOGGER_CONFIG,
      useValue:
      {
        level: 'debug',
        withTimestamp: true,
        withColors: true,        
      }
    },

    ConfigService,
    provideAppInitializer(() =>
    {
      const config = inject(ConfigService);
      return config.load();
    }),
  ]
};
import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import type { StationImageModel } from '@app/models/station-image/stationimage';
import type { StationManifestModel } from '@app/models/station-image/stationmanifest';
import { LoggerService } from '@app/services/logger/logger';
import { API_ENDPOINTS } from '@env/api-endpoints';

@Injectable({ providedIn: 'root' })
export class StationImageService
{
  private readonly log;

  constructor(
    private httpService: HttpService,
    private loggerService: LoggerService
  )
  {
    this.log = this.loggerService.withContext('StationImageService');
  }

  getImages(): Observable<StationImageModel[]>
  {
    this.log.debug('Getting station manifest…', API_ENDPOINTS.images);

    return this.httpService
      .get<StationManifestModel>(API_ENDPOINTS.images, { absolute: true })
      .pipe(
        tap((manifest) => 
          this.log.info(`Manifest loaded (${manifest.images.length} images)`)),

        map((manifest) =>
          manifest.images.map((img) =>
          {
            const file = img.src.split('/').pop() || '';
            const base = file.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            return (
              {
                src: img.src,
                alt: img.alt ?? base,
                title: img.title ?? base,
                text: img.text ?? ''
              }
            );
          })
        ),

        catchError((err) =>
        {
          this.log.warn('StationImageService', 'No manifest.json found, returning []', err);
          return of([]);
        })
      );
    }
}

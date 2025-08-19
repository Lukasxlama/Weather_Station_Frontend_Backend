import { Injectable } from '@angular/core';
import { HttpService } from '../http/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { StationImage } from '../../models/station-image/stationimage';
import { StationManifest } from '../../models/station-image/stationmanifest';
import { LoggerService } from '../logger/logger';

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

  getImages(): Observable<StationImage[]>
  {
    const url = '/assets/station/manifest.json';

    this.log.debug('Getting station manifest…', url);

    return this.httpService
      .get<StationManifest>(url, { absolute: true })
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

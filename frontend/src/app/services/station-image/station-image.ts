import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface StationImage {
  src: string;
  alt?: string;
  title?: string;
  text?: string;
}

interface StationManifest {
  generatedAt: string;
  images: StationImage[];
}

@Injectable({ providedIn: 'root' })
export class StationImageService {
  constructor(private http: HttpClient) { }

  /**
   * Loads the station images from manifest.json and maps defaults.
   */
  loadImages(): Observable<StationImage[]> {
    return this.http.get<StationManifest>('assets/station/manifest.json').pipe(
      map((manifest) =>
        manifest.images.map((img) => {
          const file = img.src.split('/').pop() || '';
          const base = file.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
          return {
            src: img.src,
            alt: img.alt || base,
            title: img.title || base,
            text: img.text || ''
          };
        })
      ),
      catchError(() =>
        // fallback in case manifest.json is missing or unreadable
        of([{ src: 'assets/station/01.jpg', alt: 'Station' }])
      )
    );
  }
}

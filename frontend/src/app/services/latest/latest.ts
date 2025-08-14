import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap } from 'rxjs';
import { ReceivedPacket } from '../../models/receivedpacket';

@Injectable({ providedIn: 'root' })
export class LatestService
{
  private apiUrl = 'http://localhost:5000/latest';

  constructor(private http: HttpClient) {}

  /**
   * Holt einmalig den neuesten Datensatz.
   */
  getLatestOnce(): Observable<ReceivedPacket>
  {
    return this.http.get<ReceivedPacket>(this.apiUrl);
  }

  /**
   * Pollt regelmäßig den neuesten Datensatz (z.B. alle 5 Sekunden)
   */
  pollLatest(intervalMs = 5000): Observable<ReceivedPacket>
  {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getLatestOnce())
    );
  }
}

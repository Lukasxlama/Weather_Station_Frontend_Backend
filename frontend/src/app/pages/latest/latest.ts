import { Component, type OnDestroy, type OnInit} from '@angular/core';
import type { ReceivedPacketModel } from '@app/models/shared/receivedpacket';
import { LatestService } from '@app/services/latest/latest';
import { SensorDataComponent } from "@app/components/sensor-data/sensor-data";
import { LoggerService } from '@app/services/logger/logger';
import { PageShellComponent } from '@app/components/page-shell/page-shell';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-latest',
  imports: [PageShellComponent, SensorDataComponent],
  templateUrl: './latest.html',
  styleUrl: './latest.css'
})
export class LatestComponent implements OnInit, OnDestroy
{
  private readonly log;
  protected receivedPacket?: ReceivedPacketModel;
  private destroy$ = new Subject<void>();

  constructor(
    private loggerService: LoggerService,
    private latestService: LatestService
  )
  {
    this.log = this.loggerService.withContext('LatestComponent');
  }

  ngOnInit(): void
  {
    this.latestService.pollLatestPacket(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
      {
        next: data => this.receivedPacket = data,
        error: err => this.log.error(err)
      }
    );
  }

  ngOnDestroy(): void
  {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

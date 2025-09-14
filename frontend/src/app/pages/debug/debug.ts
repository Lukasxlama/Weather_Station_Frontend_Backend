import { Component, ViewEncapsulation, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DebugService } from '@app/services/debug/debug';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import type { ReceivedPacketModel } from '@app/models/shared/receivedpacket';
import { PageShellComponent } from '@app/components/page-shell/page-shell';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, FormsModule, CodemirrorModule, PageShellComponent],
  templateUrl: './debug.html',
  styleUrls: ['./debug.css'],
  encapsulation: ViewEncapsulation.None
})

export class DebugComponent implements OnDestroy
{
  protected sqlQuery: string = `SELECT *\nFROM packets\nORDER BY timestamp\nDESC LIMIT 5;`;
  protected result: ReceivedPacketModel[] | null = null;
  protected resultKeys: (keyof ReceivedPacketModel)[] = [];
  protected viewMode: 'table' | 'raw' = 'table';
  protected editorOptions = { mode: 'text/x-sql', theme: 'aurora', lineNumbers: true, tabSize: 4 };
  protected isError: boolean = false;
  protected isNotSelect: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private debugService: DebugService) {}

  runQuery(): void
  {
    this.isNotSelect = !this.sqlQuery.trim().toLowerCase().startsWith('select');
    if (this.isNotSelect) return;
    
    this.debugService.runQuery(this.sqlQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: (data: ReceivedPacketModel[]) =>
          {
            this.result = data;
            this.resultKeys = data.length > 0 ? (Object.keys(data[0]) as (keyof ReceivedPacketModel)[]) : [];
            this.isError = false;
          },

          error: (err) =>
          {
            this.result =
            [
              {
                packet_number: 0,
                timestamp: new Date().toISOString(),
                rssi: 0,
                snr: 0,
                error: err.error?.message || err.message,
              } as ReceivedPacketModel
            ];

            this.resultKeys = Object.keys(this.result[0]) as (keyof ReceivedPacketModel)[];
            this.isError = true;
          }
        }
      );
  }

  toggleView(): void
  {
    this.viewMode = this.viewMode === 'table' ? 'raw' : 'table';
  }

  ngOnDestroy(): void
  {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

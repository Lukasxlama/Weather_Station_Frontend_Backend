import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DebugService } from '../../services/debug/debug';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ReceivedPacket } from '../../models/receivedpacket';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, FormsModule, CodemirrorModule],
  templateUrl: './debug.html',
  styleUrls: ['./debug.css'],
  encapsulation: ViewEncapsulation.None
})

export class Debug
{
  sqlQuery: string = `SELECT *\nFROM packets\nORDER BY timestamp\nDESC LIMIT 5;`;
  result: ReceivedPacket[] | null = null;
  resultKeys: (keyof ReceivedPacket)[] = [];
  viewMode: 'table' | 'raw' = 'table';
  editorOptions = { mode: 'text/x-sql', theme: 'aurora', lineNumbers: true, tabSize: 2 };
  isError: boolean = false;
  isNotSelect: boolean = false;

  constructor(private debugService: DebugService) {}

  runQuery(): void
  {
    const trimmed = this.sqlQuery.trim().toLowerCase();
    if (!trimmed.startsWith('select'))
    {
      this.isNotSelect = true;
      return;
    }

    else
    {
      this.isNotSelect = false;
    }
    
    this.debugService.runQuery(this.sqlQuery).subscribe(
    {
      next: (data: ReceivedPacket[]) =>
      {
        this.result = data;
        this.resultKeys = data.length > 0 ? (Object.keys(data[0]) as (keyof ReceivedPacket)[]) : [];
        this.isError = false;
      },

      error: (err) =>
      {
        this.result = [
        {
          packet_number: 0,
          timestamp: new Date().toISOString(),
          rssi: 0,
          snr: 0,
          error: err.error?.message || err.message,
        } as ReceivedPacket];

        this.resultKeys = Object.keys(this.result[0]) as (keyof ReceivedPacket)[];
        this.isError = true;
      }
    });
  }

  toggleView(): void
  {
    this.viewMode = this.viewMode === 'table' ? 'raw' : 'table';
  }
}

// src/app/pages/trend/trend.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';

import { TrendService, TrendResponse } from '../../services/trend/trend';

import {
  Chart,
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale,
  Title, Tooltip, Legend, Filler, Decimation,
  ChartOptions, TooltipItem
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale,
  Title, Tooltip, Legend, Filler, Decimation, zoomPlugin
);

@Component({
  standalone: true,
  selector: 'app-trend',
  imports: [CommonModule],
  templateUrl: './trend.html',
  styleUrl: './trend.css'
})
export class Trend implements OnInit, OnDestroy {
  @ViewChild('tempCanvas', { static: true }) tempCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humCanvas', { static: true }) humCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pressCanvas', { static: true }) pressCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gasCanvas', { static: true }) gasCanvas!: ElementRef<HTMLCanvasElement>;

  // streng typisiert: line chart mit Scatter-Punkten (x=ms, y=number)
  protected charts: Chart<'line', { x: number; y: number }[], unknown>[] = [];

  range: '24h' | '7d' | '30d' = '24h';
  loading = false;

  constructor(private api: TrendService) { }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  changeRange(r: typeof this.range): void {
    if (this.range === r) return;
    this.range = r;
    this.load();
  }

  private getRangeISO() {
    const now = new Date();
    const toISO = now.toISOString();
    const from = new Date(now);
    if (this.range === '24h') from.setDate(now.getDate() - 1);
    if (this.range === '7d') from.setDate(now.getDate() - 7);
    if (this.range === '30d') from.setDate(now.getDate() - 30);
    const fromISO = from.toISOString();
    return { fromISO, toISO };
  }

  private async load(): Promise<void> {
    this.loading = true;
    try {
      const { fromISO, toISO } = this.getRangeISO();
      const res = await firstValueFrom(this.api.getRange(fromISO, toISO));

      // Diagnose
      console.log('[Trends]', this.range, {
        t: res.series.temperature.length,
        h: res.series.humidity.length,
        p: res.series.pressure.length,
        g: res.series.gas_resistance.length
      });

      this.render(res);
    } catch (e) {
      console.error('Trends load error', e);
      this.render({
        bucket_seconds: 0, from: '', to: '',
        series: { temperature: [], humidity: [], pressure: [], gas_resistance: [] }
      });
    } finally {
      this.loading = false;
    }
  }

  /** Basis-Options – 24h ⇒ Stunden, sonst Tage; 24-Std-Format erzwingen */
  private baseOptionsForRange(
    unitLabel: string,
    suggested?: { min?: number; max?: number }
  ): ChartOptions<'line'> {
    const isDaily = this.range !== '24h';
    const tickFormat = isDaily ? 'dd.MM' : 'HH:mm';
    const tooltipFormat = isDaily ? 'yyyy-MM-dd HH:mm' : 'HH:mm';

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      normalized: true,
      plugins: {
        legend: { labels: { color: '#e7e9ee' } },
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<'line'>) => `${item.formattedValue} ${unitLabel}`,
            title: (items: TooltipItem<'line'>[]) => {
              const v = items?.[0]?.parsed?.x;
              return typeof v === 'number' ? format(new Date(v), tooltipFormat) : '';
            }
          }
        },
        zoom: {
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
          pan: { enabled: true, mode: 'x' },
          limits: { x: { min: undefined as any, max: undefined as any } }
        } as any,
        decimation: { enabled: true, algorithm: 'lttb', samples: 1000 } as any
      } as any,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: isDaily ? 'day' : 'hour',
            displayFormats: isDaily ? { day: tickFormat } : { hour: tickFormat }
          },
          ticks: {
            color: 'rgba(231,233,238,.85)',
            maxRotation: 0,
            callback: (value) => {
              // Chart.js liefert bei time-scale in v4 meist ms (number)
              const ms = Number(value);
              return Number.isFinite(ms) ? format(new Date(ms), tickFormat) : '';
            }
          },
          grid: { color: 'rgba(255,255,255,.08)' }
        },
        y: {
          ticks: { color: 'rgba(231,233,238,.85)' },
          grid: { color: 'rgba(255,255,255,.06)' },
          suggestedMin: suggested?.min,
          suggestedMax: suggested?.max
        }
      }
    };
  }

  private render(res: TrendResponse): void {
    // alte Charts entsorgen
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const ctxT = this.tempCanvas.nativeElement.getContext('2d')!;
    const ctxH = this.humCanvas.nativeElement.getContext('2d')!;
    const ctxP = this.pressCanvas.nativeElement.getContext('2d')!;
    const ctxG = this.gasCanvas.nativeElement.getContext('2d')!;

    const grad = (ctx: CanvasRenderingContext2D, from: string, to: string) => {
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0, from);
      g.addColorStop(1, to);
      return g;
    };

    // Gap-Schwelle: z.B. doppelte Bucket-Größe -> kleine Aussetzer überbrücken,
    // aber große Pausen (Stunden) auftrennen.
    const bucketMs = (res.bucket_seconds ?? 300) * 1000;
    const gapLimitMs = bucketMs * 2;

    // Hilfsfunktion: ISO → ms, null-sichere Konvertierung
    const toPoints = (arr: { t: string; v: number }[]) =>
      arr
        .map(d => ({ x: Date.parse(d.t), y: d.v }))
        .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
        .sort((a, b) => a.x - b.x);

    const createLine = (
      ctx: CanvasRenderingContext2D,
      label: string,
      data: { t: string; v: number }[],
      colorLine: string,
      colorFillTop: string,
      colorFillBottom: string,
      unit: string,
      sug?: { min?: number; max?: number }
    ) => {
      const chart = new Chart<'line', { x: number; y: number }[], unknown>(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label,
            parsing: false,                 // wir liefern bereits x/y
            data: toPoints(data),           // <<== ms statt ISO-String
            spanGaps: gapLimitMs,
            borderColor: colorLine,
            pointRadius: 0,
            borderWidth: 2,
            fill: true,
            backgroundColor: grad(ctx, colorFillTop, colorFillBottom),
            tension: 0.25,
          }]
        },
        options: this.baseOptionsForRange(unit, sug)
      });

      this.charts.push(chart);
    };

    // Linien
    createLine(
      ctxT, 'Temperatur',
      res.series.temperature,
      'rgba(255,185,120,0.95)', 'rgba(255,185,120,0.35)', 'rgba(255,185,120,0.03)',
      '°C', { min: -10, max: 40 }
    );

    createLine(
      ctxH, 'Luftfeuchtigkeit',
      res.series.humidity,
      'rgba(138,180,248,0.95)', 'rgba(138,180,248,0.25)', 'rgba(138,180,248,0.03)',
      '%'
    );

    createLine(
      ctxP, 'Luftdruck',
      res.series.pressure,
      'rgba(180,140,255,0.95)', 'rgba(180,140,255,0.25)', 'rgba(180,140,255,0.03)',
      'hPa'
    );

    createLine(
      ctxG, 'Gaswiderstand',
      res.series.gas_resistance,
      'rgba(90,210,200,0.95)', 'rgba(90,210,200,0.25)', 'rgba(90,210,200,0.03)',
      'Ω'
    );
  }

  resetAllZoom(): void {
    this.charts.forEach((ch: any) => {
      if (typeof ch?.resetZoom === 'function') ch.resetZoom();
    });
  }
}

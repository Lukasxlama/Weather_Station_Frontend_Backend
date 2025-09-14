import { Component, ElementRef, ViewChild, type OnDestroy, type AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import type { BlobType } from '@app/models/background/blob';

@Component({
  standalone: true,
  selector: 'app-background',
  imports: [],
  templateUrl: './background.html',
  styleUrl: './background.css'
})
export class BackgroundComponent implements AfterViewInit, OnDestroy
{
  @ViewChild('backgroundRef', { static: true }) backgroundRef!: ElementRef<HTMLDivElement>;
  private sub?: Subscription;
  private rafId = 0;
  private destroyed = false;

  private blobs: BlobType[] = [];

  private burstUntil = 0;
  private burstSteerBoost = 1.8;
  private burstImpulse = 2;

  constructor(private router: Router) {}

  ngAfterViewInit(): void
  {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    this.blobs = Array.from({ length: 4 }, () => this.makeBlob());

    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.triggerBurst());

    this.writeVars();
    this.loop();
  }

  private makeBlob(): BlobType
  {
    return (
      {
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        tx: Math.random() * 90 + 5,
        ty: Math.random() * 90 + 5,
        vx: 0,
        vy: 0,
        steer: 0.003 + Math.random() * 0.001,
        damping: 0.27 + Math.random() * 0.07,
        maxSpeed: 0.85 + Math.random() * 0.15
      }
    );
  }

  private triggerBurst()
  {
    this.burstUntil = performance.now() + 900;
    for (const blob of this.blobs)
    {
      blob.tx = Math.random() * (95 - 5) + 5;
      blob.ty = Math.random() * (95 - 5) + 5;

      const dx = blob.tx - blob.x;
      const dy = blob.ty - blob.y;
      const len = Math.hypot(dx, dy) || 1;

      blob.vx += (dx / len) * this.burstImpulse;
      blob.vy += (dy / len) * this.burstImpulse
    }
  }

  private writeVars()
  {
    const background = this.backgroundRef.nativeElement;
    if (!background) return;

    for (let i = 0; i < this.blobs.length; i++)
    {
      const blob = this.blobs[i];
      background.style.setProperty(`--g${i + 1}x`, `${blob.x}%`);
      background.style.setProperty(`--g${i + 1}y`, `${blob.y}%`);
    }
  }

  private loop = () =>
  {
    const now = performance.now();
    for (const blob of this.blobs)
    {
      const steer = now < this.burstUntil ? blob.steer * this.burstSteerBoost : blob.steer;

      const ax = (blob.tx - blob.x) * steer;
      const ay = (blob.ty - blob.y) * steer;

      blob.vx = (blob.vx + ax) * blob.damping;
      blob.vy = (blob.vy + ay) * blob.damping;

      const sp = Math.hypot(blob.vx, blob.vy);
      if (sp > blob.maxSpeed)
      {
        const s = blob.maxSpeed / (sp || 1);
        blob.vx *= s;
        blob.vy *= s;
      }

      blob.x += blob.vx;
      blob.y += blob.vy;

      if (blob.x < 2 || blob.x > 98)
      {
        blob.vx *= -0.5;
        blob.x = Math.max(2, Math.min(98, blob.x));
      }

      if (blob.y < 2 || blob.y > 98)
      {
        blob.vy *= -0.5;
        blob.y = Math.max(2, Math.min(98, blob.y));
      }

      if (Math.hypot(blob.tx - blob.x, blob.ty - blob.y) < 0.8)
      {
        blob.tx = Math.max(2, Math.min(98, blob.x + (Math.random() * 50 - 25)));
        blob.ty = Math.max(2, Math.min(98, blob.y + (Math.random() * 50 - 25)));
      }
    }

    this.writeVars();
    if (!this.destroyed) { this.rafId = requestAnimationFrame(this.loop); }
  }

  ngOnDestroy(): void
  {
      this.destroyed = true;
      cancelAnimationFrame(this.rafId);
      this.sub?.unsubscribe();
  }
}
import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import type { OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { StationImageService } from '@app/services/station-image/station-image';
import type { StationImageModel } from '@app/models/station-image/stationimage';
import { Subject, takeUntil } from 'rxjs';
import { PageShellComponent } from '@app/components/page-shell/page-shell';
import { DividerComponent } from "@app/components/divider/divider";

@Component({
  selector: 'app-about',
  imports: [PageShellComponent, DividerComponent],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('stationCarouselEl', { static: false })
  private carouselRef!: ElementRef<HTMLElement>;
  private destroy$ = new Subject<void>();
  private removeListeners: Array<() => void> = [];

  protected images: StationImageModel[] = [];
  protected activeIndex = 0;
  protected isSwitching = false;
  
  constructor(
    private stationImageService: StationImageService,
    private zone: NgZone
  ) {}

  ngOnInit(): void
  {
    this.stationImageService.getImages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(imgs =>
      {
        this.images = imgs ?? [];
        if (this.images.length === 0)
        {
          this.activeIndex = 0;
          return;
        }

        if (this.activeIndex >= this.images.length)
        {
          this.activeIndex = 0;
        }
      }
    );
  }
    
  ngAfterViewInit(): void
  {
    const element = this.carouselRef?.nativeElement;
    if (!element) return;

    const onSlide = (e: any) =>
    {
      this.zone.run(() =>
      {
        if (typeof e?.to === 'number')
        {
          this.isSwitching = true;
          this.activeIndex = e.to;
        }
      });
    };

    const onSlid = () =>
    {
      this.zone.run(() =>
      {
        this.isSwitching = false;
      });
    };

    element.addEventListener('slide.bs.carousel', onSlide);
    element.addEventListener('slid.bs.carousel', onSlid);

    this.removeListeners.push(() => element.removeEventListener('slide.bs.carousel', onSlide));
    this.removeListeners.push(() => element.removeEventListener('slid.bs.carousel', onSlid));
  }

  ngOnDestroy(): void
  {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeListeners.forEach(fn => fn());
    this.removeListeners = [];
  }
}

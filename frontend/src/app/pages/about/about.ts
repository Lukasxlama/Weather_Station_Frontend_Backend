import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { StationImageService } from '../../services/station-image/station-image';
import { StationImage } from '../../models/station-image/stationimage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('stationCarouselEl', { static: false })
  private carouselRef!: ElementRef<HTMLElement>;
    images: StationImage[] = [];
    activeIndex = 0;
    isSwitching = false;
  
    private latestSub?: Subscription;
    private imagesSub?: Subscription;
    private removeListeners: Array<() => void> = [];

    constructor(
        private stationImageService: StationImageService,
        private zone: NgZone
      ) {}

    ngOnInit(): void
    {
      this.imagesSub = this.stationImageService.getImages().subscribe(imgs => {
        this.images = imgs ?? [];
        if (this.images.length === 0) {
          this.activeIndex = 0;
          return;
        }
        if (this.activeIndex >= this.images.length) {
          this.activeIndex = 0;
        }
      });
    }
    
  ngAfterViewInit(): void {
    const el = this.carouselRef?.nativeElement;
    if (!el) return;

    const onSlide = (e: any) => {
      // Bootstrap-Event -> zurück in Angular Zone
      this.zone.run(() => {
        if (typeof e?.to === 'number') {
          this.isSwitching = true;
          this.activeIndex = e.to;   // sofort Text/Captions updaten
        }
      });
    };

    const onSlid = () => {
      this.zone.run(() => {
        this.isSwitching = false;    // Fade wieder zurück
      });
    };

    el.addEventListener('slide.bs.carousel', onSlide);
    el.addEventListener('slid.bs.carousel', onSlid);

    // for Cleanup
    this.removeListeners.push(() => el.removeEventListener('slide.bs.carousel', onSlide));
    this.removeListeners.push(() => el.removeEventListener('slid.bs.carousel', onSlid));
  }

  ngOnDestroy(): void {
    this.latestSub?.unsubscribe();
    this.imagesSub?.unsubscribe();
    this.removeListeners.forEach(fn => fn());
    this.removeListeners = [];
  }
}

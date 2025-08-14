import { Component, OnInit } from '@angular/core';
import { ReceivedPacket as ReceivedPacketModel } from '../../models/receivedpacket';
import { StationImage, StationImageService } from '../../services/station-image/station-image';
import { LatestService } from '../../services/latest/latest';
import { SensorData } from "../../components/sensor-data/sensor-data";

@Component({
  selector: 'app-latest',
  imports: [SensorData],
  templateUrl: './latest.html',
  styleUrl: './latest.css'
})
export class Latest implements OnInit
{
  receivedPacket?: ReceivedPacketModel;

  // Images for the carousel
  images: StationImage[] = [];
  activeIndex = 0;
  isSwitching = false;

  constructor(private stationImageService: StationImageService, private latestService: LatestService) { }

  ngOnInit(): void
  {
    this.latestService.pollLatest(5000).subscribe({
      next: data => this.receivedPacket = data,
      error: err => console.error('Fehler beim Laden der Paketdaten', err)
    });

    this.stationImageService.loadImages().subscribe((imgs) => (this.images = imgs));
  }

  ngAfterViewInit(): void {
    const el = document.getElementById('stationCarousel');
    if (!el) return;

    // Sofort umschalten: slide.bs.carousel (nicht erst slid)
    el.addEventListener('slide.bs.carousel', (e: any) => {
      if (typeof e.to === 'number') {
        this.isSwitching = true;
        this.activeIndex = e.to;  // Text wechselt direkt
      }
    });

    // Fade-out zurücknehmen, wenn Animation fertig
    el.addEventListener('slid.bs.carousel', () => {
      this.isSwitching = false;
    });
  }
}

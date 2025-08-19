import { Component} from '@angular/core';
import { ReceivedPacket as ReceivedPacketModel } from '../../models/shared/receivedpacket';
import { LatestService } from '../../services/latest/latest';
import { SensorData } from "../../components/sensor-data/sensor-data";

@Component({
  selector: 'app-latest',
  imports: [SensorData],
  templateUrl: './latest.html',
  styleUrl: './latest.css'
})
export class Latest
{
  receivedPacket?: ReceivedPacketModel;

  constructor(private latestService: LatestService) {}

  ngOnInit(): void
  {
    this.latestService.pollLatestPacket(1000).subscribe(
    {
      next: data => this.receivedPacket = data,
      error: err => console.error('Fehler beim Laden der Paketdaten', err)
    });
  }
}

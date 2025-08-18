import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorData as SensorDataModel } from '../../models/sensordata';
import { SensorDataItem, SensorDataIcon } from '../sensor-data-item/sensor-data-item';
import { ReceivedPacket as ReceivedPacketModel } from '../../models/receivedpacket';

@Component({
  standalone: true,
  selector: 'app-sensor-data',
  imports: [CommonModule, SensorDataItem],
  templateUrl: './sensor-data.html',
  styleUrl: './sensor-data.css'
})

export class SensorData implements OnInit, OnDestroy
{
  /** The full sensor-data payload to display */
  @Input() receivedPacket!: ReceivedPacketModel;
  
  protected get sensorData(): SensorDataModel
  {
    return this.receivedPacket.sensor_data;
  }

  private intervalId: any;

  ngOnInit() {
    // Alle 60 Sekunden Zeit neu berechnen
    this.intervalId = setInterval(() => {
      // Trigger Change Detection
    }, 60_000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  /** Fixed display order */
  protected sensorKeys: (keyof SensorDataModel)[] = [
    'temperature',
    'humidity',
    'pressure',
    'gas_resistance',
    'timestamp'
  ];

  /** Human-friendly labels */
  protected labels: Record<keyof SensorDataModel, string> = {
    temperature: 'Temperatur',
    humidity: 'Luftfeuchtigkeit',
    pressure: 'Luftdruck',
    gas_resistance: 'Gaswiderstand',
    timestamp: 'Timestamp'
  };

  protected units: Record<keyof SensorDataModel, string> = {
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    gas_resistance: 'kΩ',
    timestamp: 'Uhr'
  };

  /** Icons from our enum */
  protected iconMap: Record<keyof SensorDataModel, SensorDataIcon> = {
    temperature: SensorDataIcon.temperature,
    humidity: SensorDataIcon.humidity,
    pressure: SensorDataIcon.pressure,
    gas_resistance: SensorDataIcon.gas_resistance,
    timestamp: SensorDataIcon.timestamp,
  };

  get relativeTime(): string {
    if (!this.receivedPacket?.timestamp) return '';
    const diffMin = Math.floor((Date.now() - new Date(this.receivedPacket.timestamp).getTime()) / 60000);
    return diffMin <= 0 ? 'gerade eben' : `vor ${diffMin} Minute${diffMin > 1 ? 'n' : ''}`;
  }
}

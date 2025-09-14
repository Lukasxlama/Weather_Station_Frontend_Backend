import { Component, Input } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SensorDataModel } from '../../models/shared/sensordata';
import { SensorDataItemComponent } from '../sensor-data-item/sensor-data-item';
import { SensorDataIconEnum } from '@app/models/sensor-data-items/sensor-data-icon';
import type { ReceivedPacketModel } from '../../models/shared/receivedpacket';

@Component({
  standalone: true,
  selector: 'app-sensor-data',
  imports: [CommonModule, SensorDataItemComponent],
  templateUrl: './sensor-data.html',
  styleUrl: './sensor-data.css'
})

export class SensorDataComponent implements OnInit, OnDestroy
{
  @Input() receivedPacket!: ReceivedPacketModel;
  
  protected get sensorData(): SensorDataModel
  {
    return this.receivedPacket.sensor_data;
  }

  private intervalId: any;

  ngOnInit()
  {
    this.intervalId = setInterval(() => {}, 60_000);
  }

  ngOnDestroy()
  {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  protected sensorKeys: (keyof SensorDataModel)[] =
  [
    'temperature',
    'humidity',
    'pressure',
    'gas_resistance',
    'timestamp'
  ];

  protected labels: Record<keyof SensorDataModel, string> =
  {
    temperature: 'Temperatur',
    humidity: 'Luftfeuchtigkeit',
    pressure: 'Luftdruck',
    gas_resistance: 'Gaswiderstand',
    timestamp: 'Timestamp'
  };

  protected units: Record<keyof SensorDataModel, string> =
  {
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    gas_resistance: 'kΩ',
    timestamp: 'Uhr'
  };

  protected iconMap: Record<keyof SensorDataModel, SensorDataIconEnum> =
  {
    temperature: SensorDataIconEnum.temperature,
    humidity: SensorDataIconEnum.humidity,
    pressure: SensorDataIconEnum.pressure,
    gas_resistance: SensorDataIconEnum.gas_resistance,
    timestamp: SensorDataIconEnum.timestamp,
  };

  get relativeTime(): string
  {
    if (!this.receivedPacket?.timestamp) return '';
    const diffMin = Math.floor((Date.now() - new Date(this.receivedPacket.timestamp).getTime()) / 60000);
    return diffMin <= 0 ? 'gerade eben' : `vor ${diffMin} Minute${diffMin > 1 ? 'n' : ''}`;
  }
}

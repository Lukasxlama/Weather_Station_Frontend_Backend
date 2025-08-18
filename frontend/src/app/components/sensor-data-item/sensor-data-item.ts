import { Component, Input } from '@angular/core';

/**
 * Enum mapping each SensorData field to its Bootstrap Icon class.
 */
export enum SensorDataIcon
{
  temperature = 'bi-thermometer-half',
  humidity = 'bi-droplet-half',
  pressure = 'bi-speedometer2',
  gas_resistance = 'bi-wind',
  timestamp = 'bi-clock',
}

@Component({
  selector: 'app-sensor-data-item',
  imports: [],
  templateUrl: './sensor-data-item.html',
  styleUrl: './sensor-data-item.css'
})

export class SensorDataItem
{
  /** Label or name of the field, e.g. "Temperature" */
  @Input() name!: string;

  /** Corresponding value, e.g. 23.4 or "OK" */
  @Input() value!: string | number;

  /** Optional Unit, e.g. °C, %, hPa */
  @Input() unit?: string;

  /** Optional Bootstrap Icon class, e.g. "bi-thermometer-half" */
  @Input() icon?: SensorDataIcon;

  get displayValue(): string {
    let valueStr: string;
    if (this.name.toLowerCase().includes('timestamp') && typeof this.value === 'string') {
      const date = new Date(this.value);
      valueStr = date.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
    } else {
      valueStr = String(this.value);
    }
    return this.unit ? `${valueStr} ${this.unit}` : valueStr;
  }
}
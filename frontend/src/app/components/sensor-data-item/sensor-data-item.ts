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

  /** Optional Bootstrap Icon class, e.g. "bi-thermometer-half" */
  @Input() icon?: SensorDataIcon;

  get displayValue(): string {
    if (this.name.toLowerCase().includes('timestamp') && typeof this.value === 'string') {
      const date = new Date(this.value);
      return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    }
    return String(this.value);
  }

}
import { Component, Input } from '@angular/core';
import { SensorDataIconEnum } from '@app/models/sensor-data-items/sensor-data-icon';

@Component({
  selector: 'app-sensor-data-item',
  imports: [],
  templateUrl: './sensor-data-item.html',
  styleUrl: './sensor-data-item.css'
})

export class SensorDataItemComponent
{
  @Input() name!: string;
  @Input() value!: string | number;
  @Input() unit?: string;
  @Input() icon?: SensorDataIconEnum;

  get displayValue(): string
  {
    let valueStr: string;
    if (this.name.toLowerCase().includes('timestamp') && typeof this.value === 'string')
    {
      const date = new Date(this.value);
      valueStr = date.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
    }
    
    else
    {
      valueStr = String(this.value);
    }
    
    return this.unit ? `${valueStr} ${this.unit}` : valueStr;
  }
}
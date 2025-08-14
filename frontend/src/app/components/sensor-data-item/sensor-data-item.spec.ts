import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDataItem } from './sensor-data-item';

describe('SensorDataItem', () => {
  let component: SensorDataItem;
  let fixture: ComponentFixture<SensorDataItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDataItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorDataItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

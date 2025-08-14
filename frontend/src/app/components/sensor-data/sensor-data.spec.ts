import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorData } from './sensor-data';

describe('SensorData', () => {
  let component: SensorData;
  let fixture: ComponentFixture<SensorData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

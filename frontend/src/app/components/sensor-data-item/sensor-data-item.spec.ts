import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorDataItemComponent } from './sensor-data-item';

describe('SensorDataItem', () =>
{
  let component: SensorDataItemComponent;
  let fixture: ComponentFixture<SensorDataItemComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule(
      {
        imports: [SensorDataItemComponent]
      }
    ).compileComponents();

    fixture = TestBed.createComponent(SensorDataItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});

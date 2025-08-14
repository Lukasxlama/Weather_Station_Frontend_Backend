import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendMetric } from './trend-metric';

describe('TrendMetric', () => {
  let component: TrendMetric;
  let fixture: ComponentFixture<TrendMetric>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendMetric]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendMetric);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

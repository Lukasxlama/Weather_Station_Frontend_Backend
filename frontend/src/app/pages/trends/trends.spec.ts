import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trends } from './trends';

describe('Trend', () => {
  let component: Trends;
  let fixture: ComponentFixture<Trends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trends]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trends);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

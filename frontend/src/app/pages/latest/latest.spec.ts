import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Latest } from './latest';

describe('Latest', () => {
  let component: Latest;
  let fixture: ComponentFixture<Latest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Latest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Latest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

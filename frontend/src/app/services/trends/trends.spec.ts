import { TestBed } from '@angular/core/testing';
import { TrendsService } from './trends';

describe('Trend', () =>
{
  let service: TrendsService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrendsService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});

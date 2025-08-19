import { TestBed } from '@angular/core/testing';

import { LatestService } from './latest';

describe('Latest', () => {
  let service: LatestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LatestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

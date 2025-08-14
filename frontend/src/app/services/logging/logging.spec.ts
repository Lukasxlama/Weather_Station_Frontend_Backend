import { TestBed } from '@angular/core/testing';

import { Logging } from './logging';

describe('Logging', () => {
  let service: Logging;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Logging);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

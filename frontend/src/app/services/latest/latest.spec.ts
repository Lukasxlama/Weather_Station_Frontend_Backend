import { TestBed } from '@angular/core/testing';

import { Latest } from './latest';

describe('Latest', () => {
  let service: Latest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Latest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

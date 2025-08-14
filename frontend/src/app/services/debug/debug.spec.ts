import { TestBed } from '@angular/core/testing';

import { Debug } from './debug';

describe('Debug', () => {
  let service: Debug;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Debug);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

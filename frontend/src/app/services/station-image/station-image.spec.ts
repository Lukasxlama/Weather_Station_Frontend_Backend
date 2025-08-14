import { TestBed } from '@angular/core/testing';

import { StationImage } from './station-image';

describe('StationImage', () => {
  let service: StationImage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationImage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

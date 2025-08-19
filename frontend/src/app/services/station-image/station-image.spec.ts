import { TestBed } from '@angular/core/testing';
import { StationImageService } from './station-image';

describe('StationImage', () =>
{
  let service: StationImageService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationImageService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});

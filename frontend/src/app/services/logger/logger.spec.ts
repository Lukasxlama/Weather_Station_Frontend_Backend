import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger';

describe('Logging', () =>
{
  let service: LoggerService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});

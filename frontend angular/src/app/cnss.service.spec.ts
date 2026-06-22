import { TestBed } from '@angular/core/testing';

import { CnssService } from './cnss.service';

describe('CnssService', () => {
  let service: CnssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

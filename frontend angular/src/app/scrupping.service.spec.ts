import { TestBed } from '@angular/core/testing';

import { ScruppingService } from './scrupping.service';

describe('ScruppingService', () => {
  let service: ScruppingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScruppingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

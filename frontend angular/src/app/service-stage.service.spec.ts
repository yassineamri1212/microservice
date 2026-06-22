import { TestBed } from '@angular/core/testing';

import { ServiceStageService } from './service-stage.service';

describe('ServiceStageService', () => {
  let service: ServiceStageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceStageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

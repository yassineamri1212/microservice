import { TestBed } from '@angular/core/testing';

import { SignatureServiceService } from './signature-service.service';

describe('SignatureServiceService', () => {
  let service: SignatureServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignatureServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

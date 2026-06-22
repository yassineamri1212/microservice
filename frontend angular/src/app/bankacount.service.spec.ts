import { TestBed } from '@angular/core/testing';

import { BankacountService } from './bankacount.service';

describe('BankacountService', () => {
  let service: BankacountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankacountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CardssService } from './cardss.service';

describe('CardssService', () => {
  let service: CardssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

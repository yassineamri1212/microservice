import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAcountsComponent } from './bank-acounts.component';

describe('BankAcountsComponent', () => {
  let component: BankAcountsComponent;
  let fixture: ComponentFixture<BankAcountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankAcountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BankAcountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

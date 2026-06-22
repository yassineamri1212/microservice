import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckreservationComponent } from './checkreservation.component';

describe('CheckreservationComponent', () => {
  let component: CheckreservationComponent;
  let fixture: ComponentFixture<CheckreservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckreservationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckreservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

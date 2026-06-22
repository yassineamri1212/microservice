import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnssrequestComponent } from './cnssrequest.component';

describe('CnssrequestComponent', () => {
  let component: CnssrequestComponent;
  let fixture: ComponentFixture<CnssrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnssrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CnssrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

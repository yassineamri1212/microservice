import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdituserroleComponent } from './edituserrole.component';

describe('EdituserroleComponent', () => {
  let component: EdituserroleComponent;
  let fixture: ComponentFixture<EdituserroleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdituserroleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EdituserroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

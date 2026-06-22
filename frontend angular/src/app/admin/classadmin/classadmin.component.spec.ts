import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassadminComponent } from './classadmin.component';

describe('ClassadminComponent', () => {
  let component: ClassadminComponent;
  let fixture: ComponentFixture<ClassadminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassadminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignstudentComponent } from './assignstudent.component';

describe('AssignstudentComponent', () => {
  let component: AssignstudentComponent;
  let fixture: ComponentFixture<AssignstudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignstudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignstudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

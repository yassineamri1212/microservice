import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigntoclassComponent } from './assigntoclass.component';

describe('AssigntoclassComponent', () => {
  let component: AssigntoclassComponent;
  let fixture: ComponentFixture<AssigntoclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigntoclassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssigntoclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

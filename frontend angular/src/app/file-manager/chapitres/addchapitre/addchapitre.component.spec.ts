import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddchapitreComponent } from './addchapitre.component';

describe('AddchapitreComponent', () => {
  let component: AddchapitreComponent;
  let fixture: ComponentFixture<AddchapitreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddchapitreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddchapitreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterclassComponent } from './ajouterclass.component';

describe('AjouterclassComponent', () => {
  let component: AjouterclassComponent;
  let fixture: ComponentFixture<AjouterclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterclassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

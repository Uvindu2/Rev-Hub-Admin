import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianForm } from './technician-form';

describe('TechnicianForm', () => {
  let component: TechnicianForm;
  let fixture: ComponentFixture<TechnicianForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicianForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

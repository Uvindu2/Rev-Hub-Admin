import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborActivityForm } from './labor-activity-form';

describe('LaborActivityForm', () => {
  let component: LaborActivityForm;
  let fixture: ComponentFixture<LaborActivityForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaborActivityForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LaborActivityForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

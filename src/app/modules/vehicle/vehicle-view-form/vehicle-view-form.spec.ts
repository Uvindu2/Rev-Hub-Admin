import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleViewForm } from './vehicle-view-form';

describe('VehicleViewForm', () => {
  let component: VehicleViewForm;
  let fixture: ComponentFixture<VehicleViewForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleViewForm],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleViewForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

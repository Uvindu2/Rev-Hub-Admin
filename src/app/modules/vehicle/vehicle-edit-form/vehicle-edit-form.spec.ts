import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleEditForm } from './vehicle-edit-form';

describe('VehicleEditForm', () => {
  let component: VehicleEditForm;
  let fixture: ComponentFixture<VehicleEditForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleEditForm],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleEditForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

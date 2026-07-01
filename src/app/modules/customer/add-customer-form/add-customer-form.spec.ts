import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomerForm } from './add-customer-form';

describe('AddCustomerForm', () => {
  let component: AddCustomerForm;
  let fixture: ComponentFixture<AddCustomerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCustomerForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCustomerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

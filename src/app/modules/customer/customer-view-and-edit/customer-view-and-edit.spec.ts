import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewAndEdit } from './customer-view-and-edit';

describe('CustomerViewAndEdit', () => {
  let component: CustomerViewAndEdit;
  let fixture: ComponentFixture<CustomerViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

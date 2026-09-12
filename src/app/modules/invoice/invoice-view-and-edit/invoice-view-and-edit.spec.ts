import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceViewAndEdit } from './invoice-view-and-edit';

describe('InvoiceViewAndEdit', () => {
  let component: InvoiceViewAndEdit;
  let fixture: ComponentFixture<InvoiceViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

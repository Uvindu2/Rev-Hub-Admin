import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianViewAndEdit } from './technician-view-and-edit';

describe('TechnicianViewAndEdit', () => {
  let component: TechnicianViewAndEdit;
  let fixture: ComponentFixture<TechnicianViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicianViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

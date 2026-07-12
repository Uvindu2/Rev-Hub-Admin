import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborActivityViewAndEdit } from './labor-activity-view-and-edit';

describe('LaborActivityViewAndEdit', () => {
  let component: LaborActivityViewAndEdit;
  let fixture: ComponentFixture<LaborActivityViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaborActivityViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(LaborActivityViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

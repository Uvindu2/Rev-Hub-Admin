import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborActivityView } from './labor-activity-view';

describe('LaborActivityView', () => {
  let component: LaborActivityView;
  let fixture: ComponentFixture<LaborActivityView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaborActivityView],
    }).compileComponents();

    fixture = TestBed.createComponent(LaborActivityView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

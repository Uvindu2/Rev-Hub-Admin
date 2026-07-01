import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianView } from './technician-view';

describe('TechnicianView', () => {
  let component: TechnicianView;
  let fixture: ComponentFixture<TechnicianView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianView],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicianView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

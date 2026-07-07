import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardViewAndEdit } from './job-card-view-and-edit';

describe('JobCardViewAndEdit', () => {
  let component: JobCardViewAndEdit;
  let fixture: ComponentFixture<JobCardViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

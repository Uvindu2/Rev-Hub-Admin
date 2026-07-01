import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardView } from './job-card-view';

describe('JobCardView', () => {
  let component: JobCardView;
  let fixture: ComponentFixture<JobCardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardView],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

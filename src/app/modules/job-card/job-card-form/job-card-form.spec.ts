import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardForm } from './job-card-form';

describe('JobCardForm', () => {
  let component: JobCardForm;
  let fixture: ComponentFixture<JobCardForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardForm],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

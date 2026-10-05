import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { LaborActivityTableViewResponseProjection } from '../../../dto/response/LaborActivityTableViewResponseProjection';

@Component({
  selector: 'app-labor-activity-view-and-edit',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './labor-activity-view-and-edit.html',
  styleUrl: './labor-activity-view-and-edit.css'
})
export class LaborActivityViewAndEdit implements OnInit {

  laborActivityForm!: FormGroup;
  laborActivity?: LaborActivityTableViewResponseProjection;

  laborActivityId!: number;
  isEditMode = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.router.url.includes('/labor-activities/edit/');

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/dashboard/labor-activities']);
      return;
    }

    this.laborActivityId = Number(id);

    this.initForm();
    this.loadLaborActivity();
  }

  private initForm(): void {
    this.laborActivityForm = this.fb.group({
      laborActivityName: ['', Validators.required],
      active: [true, Validators.required]
    });

    if (!this.isEditMode) {
      this.laborActivityForm.disable();
    }
  }

  private loadLaborActivity(): void {
    this.adminService.getLaborActivityById(this.laborActivityId).subscribe({
      next: (response: any) => {
        this.laborActivity = response?.data || response;

        this.laborActivityForm.patchValue({
          laborActivityName: this.laborActivity?.activityName,
          active: this.laborActivity?.active
        });

        if (this.isEditMode) {
          this.laborActivityForm.enable();
        } else {
          this.laborActivityForm.disable();
        }

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Failed to load labor activity:', err);

        this.notificationService.show(
          'Failed to load labor activity.',
          'error'
        );

        this.router.navigate(['/dashboard/labor-activities']);
      }
    });
  }

  onSubmit(): void {
    if (!this.isEditMode || this.isSubmitting) {
      return;
    }

    if (this.laborActivityForm.invalid) {
      this.laborActivityForm.markAllAsTouched();

      this.notificationService.show(
        'Please fill out all required fields before submitting.',
        'error'
      );

      return;
    }

    this.isSubmitting = true;

    const formValue = this.laborActivityForm.getRawValue();

    const backendPayload = {
      laborActivityId: this.laborActivityId,
      activityName: formValue.laborActivityName,
      active: formValue.active
    };

    this.adminService
      .modifyLaborActivity(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.show(
            'Labor Activity modified successfully!',
            'success'
          );

          this.router.navigate(['/dashboard/labor-activities']);
        },

        error: (err: any) => {
          console.error('Error modifying Labor Activity:', err);

          const serverErrorMessage =
            err.error?.data ||
            'Failed to modify Labor Activity. Please verify details.';

          this.notificationService.show(
            'Error: ' + serverErrorMessage,
            'error'
          );

          this.cdr.markForCheck();
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/labor-activities']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.laborActivityForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }
}

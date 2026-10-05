import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';

@Component({
  selector: 'app-labor-activity-form',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './labor-activity-form.html',
  styleUrl: './labor-activity-form.css'
})
export class LaborActivityForm implements OnInit {

  laborActivityForm!: FormGroup;

  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.laborActivityForm = this.fb.group({
      laborActivityName: ['', Validators.required],
      active: [true, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
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
    this.cdr.markForCheck();

    const formValue = this.laborActivityForm.value;

    const backendPayload = {
      activityName: formValue.laborActivityName,
      active: formValue.active
    };

    this.adminService
      .saveLaborActivity(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.show(
            'Labor Activity saved successfully!',
            'success'
          );

          this.router.navigate([
            '/dashboard/labor-activities'
          ]);
        },

        error: (err: any) => {
          console.error(
            'Error saving Labor Activity:',
            err
          );

          const serverErrorMessage =
            err.error?.data ||
            'Failed to save Labor Activity.';

          this.notificationService.show(
            'Error: ' + serverErrorMessage,
            'error'
          );

          this.cdr.markForCheck();
        }
      });
  }

  onBack(): void {
    this.router.navigate([
      '/dashboard/labor-activities'
    ]);
  }

  isInvalid(controlName: string): boolean {
    const control =
      this.laborActivityForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }
}

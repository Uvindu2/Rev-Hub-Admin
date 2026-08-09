import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-labor-activity-form',
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './labor-activity-form.html',
  styleUrl: './labor-activity-form.css',
  standalone: true
})
export class LaborActivityForm implements OnInit {

  @Output() cancel = new EventEmitter<void>();

  laborActivityForm!: FormGroup;

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.laborActivityForm = this.fb.group({
      // Adding core validations
      laborActivityName: ['', Validators.required],
      active: [true, Validators.required] // Default to true (Active)
    });
  }

  onSubmit(): void {
    // 1. Trigger validations across ALL controls (including the common dropdown components)
    if (this.isSubmitting) {
      return;
    }

    if (this.laborActivityForm.invalid) {
      this.laborActivityForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields before submitting.', 'error');
      return; // Block submission execution completely
    }

    this.isSubmitting = true;

    const formValue = this.laborActivityForm.value;

    // 2. Safely construct the exact payload contract structure expected by the backend
    const backendPayload = {
      activityName: formValue.laborActivityName,
      active: formValue.active
    };

    // 3. Dispatch the payload request
    this.adminService.saveLaborActivity(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('Labor Activity saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Labor Activity', err);
        this.notificationService.show('Failed to save Labor Activity. Please verify details.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.laborActivityForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

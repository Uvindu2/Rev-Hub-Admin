import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CommonModule, NgIf} from '@angular/common';
import {LaborActivityProjection} from '../../../dto/response/LaborActivityProjection';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-labor-activity-view-and-edit',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './labor-activity-view-and-edit.html',
  styleUrl: './labor-activity-view-and-edit.css',
  standalone: true
})
export class LaborActivityViewAndEdit {

  @Input() laborActivity: LaborActivityProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
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

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.laborActivity) {
      this.patchFormWithData(this.laborActivity);
    }
  }

  private patchFormWithData(data: LaborActivityProjection): void {
    // Use patchValue with a complete object map
    this.laborActivityForm.patchValue({
      laborActivityName: data.activityName,
      active: data.active
    }, {emitEvent: false}); // <--- Crucial: Prevents recursive form loops

    this.cdr.markForCheck();
  }

  initForm(): void {
    this.laborActivityForm = this.fb.group({
      // Adding core validations
      laborActivityName: ['', Validators.required],
      active: [true, Validators.required] // Default to true (Active)
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    // 1. Trigger validations across ALL controls (including the common dropdown components)
    if (this.laborActivityForm.invalid) {
      this.laborActivityForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields before submitting.', 'error');
      return; // Block submission execution completely
    }
    this.isSubmitting = true;
    const formValue = this.laborActivityForm.value;

    // 2. Safely construct the exact payload contract structure expected by the backend
    const backendPayload = {
      laborActivityId: this.laborActivity?.laborActivityId,
      activityName: formValue.laborActivityName,
      active: formValue.active
    };

    // 3. Dispatch the payload request
    this.adminService.modifyLaborActivity(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('Labor Activity modified successfully!', 'success');
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

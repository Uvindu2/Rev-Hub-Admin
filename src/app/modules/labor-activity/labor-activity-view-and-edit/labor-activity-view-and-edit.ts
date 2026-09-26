import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {NgIf} from '@angular/common';
import {LaborActivityTableViewResponseProjection} from '../../../dto/response/LaborActivityTableViewResponseProjection';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-labor-activity-view-and-edit',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './labor-activity-view-and-edit.html',
  styleUrl: './labor-activity-view-and-edit.css',
  standalone: true
})
export class LaborActivityViewAndEdit implements OnInit, AfterViewInit, OnChanges {

  @Input() laborActivity: LaborActivityTableViewResponseProjection | undefined;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditModalOpen'] && this.laborActivityForm) {
      this.updateFormMode();
    }

    if (changes['laborActivity'] && this.laborActivity && this.laborActivityForm) {
      this.patchFormWithData(this.laborActivity);
    }
  }

  initForm(): void {
    this.laborActivityForm = this.fb.group({
      laborActivityName: ['', Validators.required],
      active: ['', Validators.required]
    });

    this.updateFormMode();
  }

  ngAfterViewInit(): void {
    if (this.laborActivity) {
      this.patchFormWithData(this.laborActivity);
    }
  }

  private updateFormMode(): void {
    if (!this.laborActivityForm) {
      return;
    }

    if (this.isEditModalOpen) {
      this.laborActivityForm.enable();
    } else {
      this.laborActivityForm.disable();
    }

    this.cdr.markForCheck();
  }

  private patchFormWithData(data: LaborActivityTableViewResponseProjection): void {
    this.laborActivityForm.patchValue({
      laborActivityName: data.activityName,
      active: data.active
    }, {emitEvent: false});

    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isEditModalOpen) {
      return;
    }

    if (this.laborActivityForm.invalid) {
      this.laborActivityForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields before submitting.', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.laborActivityForm.value;

    const backendPayload = {
      laborActivityId: this.laborActivity?.laborActivityId,
      activityName: formValue.laborActivityName,
      active: formValue.active
    };

    this.adminService.modifyLaborActivity(backendPayload).pipe(
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

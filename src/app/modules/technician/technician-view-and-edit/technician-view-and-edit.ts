import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TechnicianProjection} from '../../../dto/response/TechnicianProjection';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';

@Component({
  selector: 'app-technician-view-and-edit',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './technician-view-and-edit.html',
  styleUrl: './technician-view-and-edit.css',
})
export class TechnicianViewAndEdit implements OnInit, AfterViewInit{
  @Input() technician: TechnicianProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

  technicianForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.technician) {
      this.patchFormWithData(this.technician);
    }
  }


  private patchFormWithData(data: TechnicianProjection): void {
    // Use patchValue with a complete object map
    this.technicianForm.patchValue({
      technicianName: data.technicianName,
      technicianContact: data.technicianContact,
      speciality: data.speciality
    }, {emitEvent: false}); // <--- Crucial: Prevents recursive form loops

    this.cdr.markForCheck();
  }

  initForm(): void {
    this.technicianForm = this.fb.group({
      technicianName: ['', Validators.required],
      technicianContact: ['', Validators.required],
      speciality: ['']
    });
  }

  onSubmit(): void {
    if (this.technicianForm.invalid) {
      this.technicianForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    const formValue = this.technicianForm.value;

    const backendPayload = {
      technicianId: this.technician?.technicianId,
      technicianName: formValue.technicianName,
      technicianContact: formValue.technicianContact,
      specialty: formValue.specialty,
    };

    this.adminService.modfiyTechnician(backendPayload).subscribe({
      next: () => {
        this.notificationService.show('Technician modified successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Technician:', err);
        this.notificationService.show('Failed to modified Technician.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.technicianForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

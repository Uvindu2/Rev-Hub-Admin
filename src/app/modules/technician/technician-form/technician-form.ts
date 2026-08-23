import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MultiSelectDropdown} from "../../../shared/components/multi-select-dropdown/multi-select-dropdown";
import {NgForOf, NgIf} from "@angular/common";
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {TechnicianProjection} from '../../../dto/response/TechnicianProjection';

@Component({
  selector: 'app-technician-form',
    imports: [
        FormsModule,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './technician-form.html',
  styleUrl: './technician-form.css',
})
export class TechnicianForm implements OnInit {
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
      technicianName: formValue.technicianName,
      technicianContact: formValue.technicianContact,
      speciality: formValue.speciality,
    };

    this.adminService.saveTechnician(backendPayload).subscribe({
      next: () => {
        this.notificationService.show('Technician saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Technician:', err);
        this.notificationService.show('Failed to save Technician.', 'error');
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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AddCustomerForm } from '../../customer/add-customer-form/add-customer-form';
import { VehicleResponseProjection } from '../../../dto/response/VehicleResponseProjection';
import { CustomerResponseProjection } from '../../../dto/response/CustomerResponseProjection';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';

@Component({
  selector: 'app-vehicle-edit-form',
  standalone: true,
  imports: [CommonModule, AddCustomerForm, ReactiveFormsModule],
  templateUrl: './vehicle-edit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './vehicle-edit-form.css'
})
export class VehicleEditFormComponent implements OnInit {

  vehicleForm!: FormGroup;
  vehicle?: VehicleResponseProjection;

  currentCustomer: CustomerResponseProjection | null = null;

  showCustomerPopup = false;
  isSubmitting = false;
  isLoading = false;
  isEditMode = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    const mode = history.state?.['mode'];

    this.isEditMode = mode === 'edit';

    if (!vehicleId) {
      this.onBack();
      return;
    }

    this.loadVehicle(vehicleId);
  }

  private initForm(): void {
    this.vehicleForm = this.fb.group({
      vehicleRegNo: [{ value: '', disabled: true }, Validators.required],
      vehicleMake: ['', Validators.required],
      vehicleYear: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      colour: [''],
      customerId: [null]
    });

    this.updateFormMode();
  }

  private loadVehicle(vehicleId: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.adminService.getVehicleById(vehicleId).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {
        this.vehicle = response?.data;

        if (!this.vehicle) {
          this.notificationService.show('Vehicle not found.', 'error');
          this.onBack();
          return;
        }

        this.currentCustomer = this.vehicle.customer || null;

        this.vehicleForm.patchValue({
          vehicleRegNo: this.vehicle.vehicleRegNo || '',
          vehicleMake: this.vehicle.vehicleMake || '',
          vehicleYear: this.vehicle.vehicleYear || '',
          vehicleModel: this.vehicle.vehicleModel || '',
          colour: this.vehicle.colour || '',
          customerId: this.currentCustomer?.customerId || null
        }, { emitEvent: false });

        this.updateFormMode();
        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load vehicle:', err);

        const errorMessage = err?.error?.message || err?.error?.data || 'Failed to load vehicle.';

        this.notificationService.show(errorMessage, 'error');
        this.onBack();
      }
    });
  }

  private updateFormMode(): void {
    if (!this.vehicleForm) return;

    if (this.isEditMode) {
      this.vehicleForm.get('vehicleMake')?.enable();
      this.vehicleForm.get('vehicleYear')?.enable();
      this.vehicleForm.get('vehicleModel')?.enable();
      this.vehicleForm.get('colour')?.enable();
      this.vehicleForm.get('customerId')?.enable();
      this.vehicleForm.get('vehicleRegNo')?.disable();
    } else {
      this.vehicleForm.disable();
    }
  }

  onCustomerSaved(customer: CustomerResponseProjection): void {
    this.currentCustomer = customer;
    this.vehicleForm.patchValue({ customerId: customer.customerId });
    this.showCustomerPopup = false;
    this.cdr.markForCheck();
  }

  removeCustomer(): void {
    if (!this.isEditMode) return;

    this.currentCustomer = null;
    this.vehicleForm.patchValue({ customerId: null });
    this.cdr.markForCheck();
  }

  isInvalid(controlName: string): boolean {
    const control = this.vehicleForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submitForm(): void {
    if (this.isSubmitting || !this.isEditMode) return;

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields.', 'error');
      return;
    }

    if (!this.currentCustomer) {
      this.notificationService.show('Please assign a customer.', 'error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.vehicleForm.getRawValue();

    const backendPayload = {
      vehicleRegNo: formValue.vehicleRegNo,
      vehicleMake: formValue.vehicleMake,
      vehicleModel: formValue.vehicleModel,
      vehicleYear: formValue.vehicleYear,
      vehicleMileage: formValue.vehicleMileage,
      colour: formValue.colour,
      otherSpecs: formValue.otherSpecs,
      customerId: this.currentCustomer.customerId || 0,
      customer: this.currentCustomer.customerId ? null : {
        customerName: this.currentCustomer.customerName,
        customerAddress: this.currentCustomer.customerAddress,
        contactNumbers: this.currentCustomer.contactNumber,
        email: this.currentCustomer.email,
        drivingLicenseNumber: this.currentCustomer.drivingLicenseNumber,
        active: true
      }
    };

    console.log('Payload sending to backend:', backendPayload);

    this.adminService.modifyVehicle(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.notificationService.show('Vehicle modified successfully!', 'success');
        this.router.navigate(['/dashboard/vehicles']);
      },

      error: (err: any) => {
        const errorMsg = err?.error?.message || err?.error?.data || 'Failed to modify vehicle.';
        this.notificationService.show(errorMsg, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  onCancelEdit(): void {
    if (!this.vehicle) {
      this.onBack();
      return;
    }

    this.vehicleForm.patchValue({
      vehicleRegNo: this.vehicle.vehicleRegNo || '',
      vehicleMake: this.vehicle.vehicleMake || '',
      vehicleYear: this.vehicle.vehicleYear || '',
      vehicleModel: this.vehicle.vehicleModel || '',
      colour: this.vehicle.colour || '',
      customerId: this.vehicle.customer?.customerId || null
    }, { emitEvent: false });

    this.currentCustomer = this.vehicle.customer || null;
    this.isEditMode = false;

    this.updateFormMode();
    this.cdr.markForCheck();
  }

  onBack(): void {
    this.router.navigate(['/dashboard/vehicles']);
  }
}

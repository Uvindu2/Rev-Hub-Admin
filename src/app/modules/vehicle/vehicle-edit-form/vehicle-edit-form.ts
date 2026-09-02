import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCustomerForm } from '../../customer/add-customer-form/add-customer-form';
import { VehicleProjection } from '../../../dto/response/VehicleProjection';
import { CustomerProjection } from '../../../dto/response/CustomerProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-vehicle-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCustomerForm, ReactiveFormsModule],
  templateUrl: './vehicle-edit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Changed to OnPush for better performance
  styleUrl: './vehicle-edit-form.css'
})
export class VehicleEditFormComponent implements OnInit, AfterViewInit {

  @Input() vehicle: VehicleProjection | undefined;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  vehicleForm!: FormGroup;
  currentCustomer: CustomerProjection | null = null;
  showCustomerPopup = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. Initialize the "Slot"
    this.currentCustomer = this.vehicle?.customer || null;
    this.initForm();
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      vehicleRegNo: [this.vehicle?.vehicleRegNo || '', Validators.required],
      vehicleMake: [this.vehicle?.vehicleMake || '', Validators.required],
      vehicleYear: [this.vehicle?.vehicleYear || '', Validators.required],
      vehicleModel: [this.vehicle?.vehicleModel || '', Validators.required],
      // This is our hidden field for validation
      customerId: [this.currentCustomer?.customerId || null]
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onCustomerSaved(customer: CustomerProjection): void {
    this.currentCustomer = customer;
    this.vehicleForm.patchValue({ customerId: customer.customerId });
    this.showCustomerPopup = false;
    this.cdr.markForCheck();
  }

  removeCustomer(): void {
    this.currentCustomer = null;
    this.vehicleForm.patchValue({ customerId: '' });
    this.cdr.markForCheck();
  }

  isInvalid(controlName: string): boolean {
    const control = this.vehicleForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  submitForm(): void {
    if (this.isSubmitting) {
      return;
    }
    // Validation check
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
    // Define the payload structure inline
    const backendPayload = {
      vehicleRegNo: this.vehicleForm.value.vehicleRegNo,
      vehicleMake: this.vehicleForm.value.vehicleMake,
      vehicleModel: this.vehicleForm.value.vehicleModel,
      vehicleYear: this.vehicleForm.value.vehicleYear,
      vehicleMileage: this.vehicleForm.value.vehicleMileage,
      colour: this.vehicleForm.value.colour,
      otherSpecs: this.vehicleForm.value.otherSpecs,

      // Logic for Customer
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

    // Send
    this.adminService.modifyVehicle(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('Vehicle modified successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        // Show backend error message if available
        const errorMsg = err.error?.message || 'Failed to modify vehicle.';
        this.notificationService.show(errorMsg, 'error');
      }
    });
  }

  closeForm(): void {
    this.cancel.emit();
  }
}

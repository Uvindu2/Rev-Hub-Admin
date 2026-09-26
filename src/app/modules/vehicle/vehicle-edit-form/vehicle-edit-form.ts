import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCustomerForm } from '../../customer/add-customer-form/add-customer-form';
import { VehicleResponseProjection } from '../../../dto/response/VehicleResponseProjection';
import { CustomerResponseProjection } from '../../../dto/response/CustomerResponseProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-vehicle-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCustomerForm, ReactiveFormsModule],
  templateUrl: './vehicle-edit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './vehicle-edit-form.css'
})
export class VehicleEditFormComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() vehicle: VehicleResponseProjection | undefined;
  @Input() isEditModalOpen: boolean = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  vehicleForm!: FormGroup;
  currentCustomer: CustomerResponseProjection | null = null;
  showCustomerPopup = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    console.log(this.isEditModalOpen)
    this.currentCustomer = this.vehicle?.customer || null;
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditModalOpen'] && this.vehicleForm) {
      this.updateFormMode();
      this.cdr.markForCheck();
    }

    if (changes['vehicle'] && this.vehicle && this.vehicleForm) {
      this.currentCustomer = this.vehicle.customer || null;

      this.vehicleForm.patchValue({
        vehicleRegNo: this.vehicle.vehicleRegNo || '',
        vehicleMake: this.vehicle.vehicleMake || '',
        vehicleYear: this.vehicle.vehicleYear || '',
        vehicleModel: this.vehicle.vehicleModel || '',
        colour: this.vehicle.colour || '',
        customerId: this.currentCustomer?.customerId || null
      });

      this.updateFormMode();
      this.cdr.markForCheck();
    }
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      vehicleRegNo: [{value: this.vehicle?.vehicleRegNo || '', disabled: true}, Validators.required],
      vehicleMake: [this.vehicle?.vehicleMake || '', Validators.required],
      vehicleYear: [this.vehicle?.vehicleYear || '', Validators.required],
      vehicleModel: [this.vehicle?.vehicleModel || '', Validators.required],
      colour: [this.vehicle?.colour || ''],
      customerId: [this.currentCustomer?.customerId || null]
    });

    this.updateFormMode();
  }

  private updateFormMode(): void {
    if (!this.vehicleForm) {
      return;
    }

    if (this.isEditModalOpen) {
      this.vehicleForm.get('vehicleMake')?.enable();
      this.vehicleForm.get('vehicleYear')?.enable();
      this.vehicleForm.get('vehicleModel')?.enable();
      this.vehicleForm.get('colour')?.enable();

      // Registration number should remain disabled
      this.vehicleForm.get('vehicleRegNo')?.disable();

      this.vehicleForm.get('customerId')?.enable();
    } else {
      this.vehicleForm.disable();
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onCustomerSaved(customer: CustomerResponseProjection): void {
    this.currentCustomer = customer;
    this.vehicleForm.patchValue({customerId: customer.customerId});
    this.showCustomerPopup = false;
    this.cdr.markForCheck();
  }

  removeCustomer(): void {
    if (!this.isEditModalOpen) {
      return;
    }

    this.currentCustomer = null;
    this.vehicleForm.patchValue({customerId: ''});
    this.cdr.markForCheck();
  }

  isInvalid(controlName: string): boolean {
    const control = this.vehicleForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submitForm(): void {
    if (this.isSubmitting || !this.isEditModalOpen) {
      return;
    }

    this.vehicleForm.get('vehicleMake')?.enable();
    this.vehicleForm.get('vehicleYear')?.enable();
    this.vehicleForm.get('vehicleModel')?.enable();
    this.vehicleForm.get('colour')?.enable();

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
      })
    ).subscribe({
      next: (res: any) => {
        this.notificationService.show('Vehicle modified successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'Failed to modify vehicle.';
        this.notificationService.show(errorMsg, 'error');
      }
    });
  }

  closeForm(): void {
    this.cancel.emit();
  }
}

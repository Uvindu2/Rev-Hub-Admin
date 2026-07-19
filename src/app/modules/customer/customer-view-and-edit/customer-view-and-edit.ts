import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {NgForOf, NgIf} from '@angular/common';
import {ItemProjection} from '../../../dto/response/ItemProjection';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CustomerProjection} from '../../../dto/response/CustomerProjection';

@Component({
  selector: 'app-customer-view-and-edit',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './customer-view-and-edit.html',
  styleUrl: './customer-view-and-edit.css',
})
export class CustomerViewAndEdit implements OnInit, AfterViewInit {
  @Input() customer: CustomerProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

  customerForm!: FormGroup;

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
    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', Validators.required],
      customerAddress: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.customer) {
      this.patchFormWithData(this.customer);
    }
  }

  private patchFormWithData(data: CustomerProjection): void {
    // Use patchValue with a complete object map
    this.customerForm.patchValue({
      customerName: data.customerName,
      contactNumber: data.contactNumber,
      email: data.email,
      customerAddress: data.customerAddress,
    }, {emitEvent: false}); // <--- Crucial: Prevents recursive form loops

    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    const formValue = this.customerForm.value;

    const backendPayload = {
      customerId: this.customer?.customerId,
      customerName: formValue.customerName,
      contactNumber: formValue.contactNumber,
      email: formValue.email,
      customerAddress: formValue.customerAddress
    };

    this.adminService.modifyCustomer(backendPayload).subscribe({
      next: (res: any) => {
        this.notificationService.show('Customer saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Customer:', err);
        this.notificationService.show('Failed to save Customer.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

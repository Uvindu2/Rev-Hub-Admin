import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CustomerResponseProjection} from '../../../dto/response/CustomerResponseProjection';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-customer-view-and-edit',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './customer-view-and-edit.html',
  styleUrl: './customer-view-and-edit.css',
  standalone: true
})
export class CustomerViewAndEdit implements OnInit, AfterViewInit {
  @Input() customer: CustomerResponseProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

  customerForm!: FormGroup;
  isSubmitting = false;

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
      contactNumber: [{ value: '', disabled: true }, Validators.required],
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

  private patchFormWithData(data: CustomerResponseProjection): void {
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
    if (this.isSubmitting) {
      return;
    }
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }
    this.isSubmitting = true;
    const formValue = this.customerForm.value;

    const backendPayload = {
      customerId: this.customer?.customerId,
      customerName: formValue.customerName,
      email: formValue.email,
      customerAddress: formValue.customerAddress
    };

    this.adminService.modifyCustomer(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('Customer saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err) => {
        console.error('Error saving Customer:', err);
        const serverErrorMessage =
          err.error?.response || 'Failed to save Customer.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');
        this.cdr.markForCheck();
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

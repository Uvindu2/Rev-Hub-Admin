import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';

@Component({
  selector: 'app-add-customer-form',
  templateUrl: './add-customer-form.html',
  styleUrls: ['./add-customer-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class AddCustomerForm implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() customerSaved = new EventEmitter<any>();

  customerAddForm!: FormGroup;
  searchContactNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.customerAddForm = this.fb.group({
      customerName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      customerAddress: ['', Validators.required],
    });
  }

  // Type-safe input handler to fix template casting errors
  onSearchInput(event: Event): void {
    this.searchContactNumber = (event.target as HTMLInputElement).value;
  }

  searchCustomer(): void {
    if (!this.searchContactNumber) {
      console.warn('Please enter a contact number to search.');
      return;
    }
    this.customerAddForm.reset();
    this.adminService.getCustomerByContactNumber(this.searchContactNumber).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.customerAddForm.patchValue({
            customerName: response.data.customerName,
            contactNumber: response.data.contactNumber,
            email: response.data.email,
            customerAddress: response.data.customerAddress
          });
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Customer not found or error occurred:', err);
        const serverErrorMessage =
          err.error?.response || 'Customer not found with this contact number.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');
        this.cdr.markForCheck();
      },
    });
  }

  saveCustomer(): void {
    if (this.customerAddForm.valid) {
      console.log('Saving form data:', this.customerAddForm.value);
      this.customerSaved.emit(null);
      this.closePopup();
    } else {
      this.notificationService.show(
        'Please fill out all required customer specification fields.',
        'warning',
      );
      this.customerAddForm.markAllAsTouched();
    }
  }

  closePopup(): void {
    this.close.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.customerAddForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}

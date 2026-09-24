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

  @Output() close = new EventEmitter();
  @Output() customerSaved = new EventEmitter();

  customerAddForm!: FormGroup;
  searchContactNumber: string = '';
  customer: any = null;

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
    // Start with form fields disabled by default since no customer exists yet
    this.customerAddForm = this.fb.group({
      customerName: [{value: '', disabled: true}, Validators.required],
      contactNumber: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      customerAddress: [{value: '', disabled: true}],
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

    this.adminService.getCustomerByContactNumber(this.searchContactNumber).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.customer = response.data;

          // Enable form fields since the customer exists
          this.customerAddForm.disable();

          this.customerAddForm.patchValue({
            customerName: response.data.customerName,
            contactNumber: response.data.contactNumber,
            email: response.data.email,
            customerAddress: response.data.customerAddress
          });
          this.cdr.markForCheck();
        } else {
          this.handleCustomerNotFound();
        }
      },
      error: (err) => {
        console.error('Customer not found or error occurred:', err);
        const serverErrorMessage =
          err.error?.response || 'Customer not found with this contact number.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');
        this.handleCustomerNotFound();

      },
    });
  }

  private handleCustomerNotFound(): void {
    this.customer = null;
    this.customerAddForm.reset();

    // Enable the form so user can fill out details for a new customer
    this.customerAddForm.enable();

    // Set contact number to the search term and disable ONLY the contact number field
    this.customerAddForm.patchValue({
      contactNumber: this.searchContactNumber
    });
    this.customerAddForm.get('contactNumber')?.disable();

    this.cdr.markForCheck();
  }

  saveCustomer(): void {
    this.customerAddForm.enable();
    if (this.customerAddForm.valid) {
      // Merge the existing customer ID (if editing/found) with the form values
      const payload = {
        customerId: this.customer ? this.customer.customerId : null,
        ...this.customerAddForm.getRawValue() // Use getRawValue() to capture disabled values if needed
      };
      this.customerAddForm.disable();
      console.log('Saving customer payload:', payload);
      this.customerSaved.emit(payload);
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

import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CustomerResponseProjection} from '../../../dto/response/CustomerResponseProjection';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-customer-view-and-edit',
  imports: [FormsModule, NgIf, ReactiveFormsModule],
  templateUrl: './customer-view-and-edit.html',
  styleUrl: './customer-view-and-edit.css',
  standalone: true
})
export class CustomerViewAndEdit implements OnInit, AfterViewInit, OnChanges {

  @Input() customer: CustomerResponseProjection | undefined;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

  customerForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log(this.isEditModalOpen);
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditModalOpen'] && this.customerForm) {
      this.updateFormMode();
    }

    if (changes['customer'] && this.customer && this.customerForm) {
      this.patchFormWithData(this.customer);
    }
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      contactNumber: [{value: '', disabled: true}, Validators.required],
      email: ['', Validators.required],
      customerAddress: ['', Validators.required]
    });

    this.updateFormMode();
  }

  private updateFormMode(): void {
    if (this.isEditModalOpen) {
      this.customerForm.get('customerName')?.enable();
      this.customerForm.get('email')?.enable();
      this.customerForm.get('customerAddress')?.enable();
      this.customerForm.get('contactNumber')?.disable();
    } else {
      this.customerForm.get('customerName')?.disable();
      this.customerForm.get('email')?.disable();
      this.customerForm.get('customerAddress')?.disable();
      this.customerForm.get('contactNumber')?.disable();
    }
  }

  ngAfterViewInit(): void {
    if (this.customer) {
      this.patchFormWithData(this.customer);
    }

    this.cdr.markForCheck();
  }

  private patchFormWithData(data: CustomerResponseProjection): void {
    this.customerForm.patchValue({
      customerName: data.customerName,
      contactNumber: data.contactNumber,
      email: data.email,
      customerAddress: data.customerAddress
    }, {emitEvent: false});

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

    const formValue = this.customerForm.getRawValue();

    const backendPayload = {
      customerId: this.customer?.customerId,
      customerName: formValue.customerName,
      email: formValue.email,
      customerAddress: formValue.customerAddress
    };

    this.adminService.modifyCustomer(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (res: any) => {
        this.notificationService.show('Customer saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err) => {
        console.error('Error saving Customer:', err);

        const serverErrorMessage = err.error?.response || 'Failed to save Customer.';
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

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CustomerResponseProjection} from '../../../dto/response/CustomerResponseProjection';

@Component({
  selector: 'app-customer-view-and-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './customer-view-and-edit.html',
  styleUrl: './customer-view-and-edit.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CustomerViewAndEdit implements OnInit {

  customerForm!: FormGroup;
  customer?: CustomerResponseProjection;

  isEditMode = false;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    const customerId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const mode = history.state?.['mode'];

    this.isEditMode = mode === 'edit';

    if (!customerId) {
      this.onBack();
      return;
    }

    this.loadCustomer(customerId);
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      contactNumber: [
        {value: '', disabled: true},
        Validators.required
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      customerAddress: ['', Validators.required]
    });

    this.updateFormMode();
  }

  private loadCustomer(customerId: number): void {
    this.isLoading = true;

    this.adminService.getCustomerById(customerId).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {

        this.customer = response?.data;

        if (!this.customer) {
          this.notificationService.show(
            'Customer not found.',
            'error'
          );

          this.onBack();
          return;
        }

        this.patchFormWithData(this.customer);
        this.updateFormMode();

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error(
          'Failed to load customer:',
          err
        );

        const serverErrorMessage =
          err?.error?.data ||
          err?.error?.message ||
          'Failed to load customer.';

        this.notificationService.show(
          'Error: ' + serverErrorMessage,
          'error'
        );

        this.onBack();
      }
    });
  }

  private patchFormWithData(
    data: CustomerResponseProjection
  ): void {

    this.customerForm.patchValue(
      {
        customerName: data.customerName,
        contactNumber: data.contactNumber,
        email: data.email,
        customerAddress: data.customerAddress
      },
      {
        emitEvent: false
      }
    );
  }

  private updateFormMode(): void {

    if (this.isEditMode) {

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

  enableEdit(): void {

    this.isEditMode = true;

    this.updateFormMode();

    this.cdr.markForCheck();
  }

  onSubmit(): void {

    if (this.isSubmitting) {
      return;
    }

    if (this.customerForm.invalid) {

      this.customerForm.markAllAsTouched();

      this.notificationService.show(
        'Please fill out all required fields correctly.',
        'error'
      );

      return;
    }

    if (!this.customer?.customerId) {

      this.notificationService.show(
        'Customer information is missing.',
        'error'
      );

      return;
    }

    this.isSubmitting = true;

    const formValue =
      this.customerForm.getRawValue();

    const backendPayload = {
      customerId: this.customer.customerId,
      customerName: formValue.customerName,
      email: formValue.email,
      customerAddress: formValue.customerAddress,
      active: this.customer.active
    };

    this.adminService.modifyCustomer(
      backendPayload
    ).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({

      next: () => {

        this.notificationService.show(
          'Customer saved successfully!',
          'success'
        );

        this.customer = {
          ...this.customer!,
          customerName: formValue.customerName,
          email: formValue.email,
          customerAddress: formValue.customerAddress
        };

        this.isEditMode = false;

        this.updateFormMode();

        this.cdr.markForCheck();
      },

      error: (err: any) => {

        console.error(
          'Error saving customer:',
          err
        );

        const serverErrorMessage =
          err?.error?.data ||
          err?.error?.message ||
          'Failed to save customer.';

        this.notificationService.show(
          'Error: ' + serverErrorMessage,
          'error'
        );

        this.cdr.markForCheck();
      }
    });
  }

  onBack(): void {
    this.router.navigate([
      '/dashboard/customers'
    ]);
  }

  isInvalid(controlName: string): boolean {

    const control =
      this.customerForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }
}

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {LaborActivityNameResponseProjection} from '../../../dto/response/LaborActivityNameResponseProjection';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';

import {
  MultiSelectDropdown
} from '../../../shared/components/multi-select-search-dropdown/multi-select-search-dropdown';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    MultiSelectDropdown
  ],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css'
})
export class ItemForm implements OnInit {

  itemForm!: FormGroup;

  laborActivityNameProjection: LaborActivityNameResponseProjection[] = [];

  unitTypesList = Object.keys(MeasuringUnitType);

  isSubmitting = false;

  unitDisplayMap: Record<string, string> = {
    [MeasuringUnitType.KILO_GRAM]: 'Kilogram (kg)',
    [MeasuringUnitType.LITER_GRAM]: 'Liter (L)',
    [MeasuringUnitType.GRAM]: 'Gram (g)',
    [MeasuringUnitType.MILLI_GRAM]: 'Milligram (mg)',
    [MeasuringUnitType.NUMBER]: 'Units (Qty)'
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadItemNames();
  }

  initForm(): void {
    this.itemForm = this.fb.group({
      itemName: ['', Validators.required],
      balanceQty: [0, [Validators.required, Validators.min(0)]],
      supplierPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      measuringUnitType: ['', Validators.required],
      laborActivitiesSelected: [[], Validators.required]
    });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: any) => {
        const data = res?.data || res;

        this.laborActivityNameProjection = Array.isArray(data)
          ? data
          : [];

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load labor activity names:', err);
        this.laborActivityNameProjection = [];
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();

      this.notificationService.show(
        'Please fill out all required fields correctly.',
        'error'
      );

      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const formValue = this.itemForm.value;

    const backendPayload = {
      itemName: formValue.itemName,
      balanceQty: formValue.balanceQty,
      supplierPrice: formValue.supplierPrice,
      sellingPrice: formValue.sellingPrice,
      measuringUnitType: formValue.measuringUnitType,
      laborActivitiesSelected: formValue.laborActivitiesSelected || []
    };

    this.adminService
      .saveItem(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.show(
            'Item saved successfully!',
            'success'
          );

          this.router.navigate(['/dashboard/items']);
        },

        error: (err: any) => {
          console.error('Error saving Item:', err);

          const serverErrorMessage =
            err.error?.response || 'Failed to save Item.';

          this.notificationService.show(
            serverErrorMessage,
            'error'
          );

          this.cdr.markForCheck();
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/items']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.itemForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return (
      this.itemForm?.get('laborActivitiesSelected') as FormControl
    ) || new FormControl([]);
  }
}

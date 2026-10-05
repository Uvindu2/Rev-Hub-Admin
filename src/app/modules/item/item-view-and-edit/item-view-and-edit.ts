import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs';

import {LaborActivityNameResponseProjection} from '../../../dto/response/LaborActivityNameResponseProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import {ItemTableViewResponseProjection} from '../../../dto/response/ItemTableViewResponseProjection';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-search-dropdown/multi-select-search-dropdown';

@Component({
  selector: 'app-item-view-and-edit',
  imports: [CommonModule, ReactiveFormsModule, MultiSelectDropdown],
  templateUrl: './item-view-and-edit.html',
  styleUrl: './item-view-and-edit.css',
  standalone: true
})
export class ItemViewAndEdit implements OnInit {

  itemForm!: FormGroup;
  item?: ItemTableViewResponseProjection;
  itemId!: number;
  laborActivityNameProjection: LaborActivityNameResponseProjection[] = [];
  unitTypesList = Object.keys(MeasuringUnitType);
  isEditMode = false;
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
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.router.url.includes('/items/edit/');

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/dashboard/items']);
      return;
    }

    this.itemId = Number(id);
    this.initForm();
    this.loadItemNames();
    this.loadItem();
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

    if (!this.isEditMode) {
      this.itemForm.disable();
    }
  }

  private loadItem(): void {
    this.adminService.getItemById(this.itemId).subscribe({
      next: (response: any) => {
        this.item = response?.data || response;

        this.itemForm.patchValue({
          itemName: this.item?.itemName,
          balanceQty: this.item?.balanceQty,
          supplierPrice: this.item?.supplierPrice,
          sellingPrice: this.item?.sellingPrice,
          measuringUnitType: this.item?.measuringUnitType,
          laborActivitiesSelected: this.item?.laborActivities?.map(a => a.laborActivityId) || []
        }, {emitEvent: false});

        if (this.isEditMode) {
          this.itemForm.enable();
        } else {
          this.itemForm.disable();
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load item:', err);
        this.notificationService.show('Failed to load item.', 'error');
        this.router.navigate(['/dashboard/items']);
      }
    });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.laborActivityNameProjection = Array.isArray(data) ? data : [];
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load names:', err);
        this.laborActivityNameProjection = [];
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isEditMode) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.itemForm.getRawValue();

    const backendPayload = {
      itemId: this.itemId,
      itemName: formValue.itemName,
      balanceQty: formValue.balanceQty,
      supplierPrice: formValue.supplierPrice,
      sellingPrice: formValue.sellingPrice,
      measuringUnitType: formValue.measuringUnitType,
      laborActivitiesSelected: formValue.laborActivitiesSelected || []
    };

    this.adminService.modifyItem(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.notificationService.show('Item saved successfully!', 'success');
        this.router.navigate(['/dashboard/items']);
      },
      error: (err: any) => {
        console.error('Error saving Item:', err);
        this.notificationService.show('Failed to save Item.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/items']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.itemForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return this.itemForm?.get('laborActivitiesSelected') as FormControl;
  }
}

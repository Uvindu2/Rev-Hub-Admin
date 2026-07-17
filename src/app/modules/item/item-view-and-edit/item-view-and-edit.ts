import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaborActivityNameProjection } from '../../../dto/response/LaborActivityNameProjection';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { MeasuringUnitType } from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import { MultiSelectDropdown } from "../../../shared/components/multi-select-dropdown/multi-select-dropdown";
import { ItemProjection } from '../../../dto/response/ItemProjection';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-view-and-edit',
  imports: [CommonModule ,MultiSelectDropdown,ReactiveFormsModule],
  templateUrl: './item-view-and-edit.html',
  styleUrl: './item-view-and-edit.css',
})
export class ItemViewAndEdit implements OnInit, AfterViewInit {
  @Input() item: ItemProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

  itemForm!: FormGroup;
  laborActivityNameProjection: LaborActivityNameProjection[] = [];
  unitTypesList = Object.keys(MeasuringUnitType);

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
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadItemNames();
    console.warn('Item data received in ItemViewAndEdit:', this.item);
  }

  initForm(): void {
    this.itemForm = this.fb.group({
      itemName: ['', Validators.required],
      balanceQty: [0, [Validators.required, Validators.min(0)]],
      supplierPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      measuringUnitType: ['', Validators.required],// e.g., 'PIECES', 'LITERS'
      laborActivitiesSelected: [[], Validators.required]
    });
  }

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.item) {
      this.patchFormWithData(this.item);
    }
  }


  private patchFormWithData(data: ItemProjection): void {
    // Use patchValue with a complete object map
    this.itemForm.patchValue({
      itemName: data.itemName,
      balanceQty: data.balanceQty,
      supplierPrice: data.supplierPrice,
      sellingPrice: data.sellingPrice,
      measuringUnitType: data.measuringUnitType,
      laborActivitiesSelected: data.laborActivities?.map(a => a.laborActivityId) || [],
    }, {emitEvent: false}); // <--- Crucial: Prevents recursive form loops

    this.cdr.markForCheck();
  }


  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: LaborActivityNameProjection[]) => {
        this.laborActivityNameProjection = res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load names', err)
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    const formValue = this.itemForm.value;

    const backendPayload = {
      itemId: this.item?.itemId,
      itemName: formValue.itemName,
      balanceQty: formValue.balanceQty,
      supplierPrice: formValue.supplierPrice,
      sellingPrice: formValue.sellingPrice,
      measuringUnitType: formValue.measuringUnitType,
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
    };

    this.adminService.modifyItem(backendPayload).subscribe({
      next: (res: any) => {
        this.notificationService.show('Item saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Item:', err);
        this.notificationService.show('Failed to save Item.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.itemForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return (this.itemForm?.get('laborActivitiesSelected') as FormControl) || new FormControl([]);
  }
}

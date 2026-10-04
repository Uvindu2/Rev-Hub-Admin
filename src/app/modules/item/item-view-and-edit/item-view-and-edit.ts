import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LaborActivityNameResponseProjection} from '../../../dto/response/LaborActivityNameResponseProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import {ItemTableViewResponseProjection} from '../../../dto/response/ItemTableViewResponseProjection';
import {CommonModule} from '@angular/common';
import {finalize} from 'rxjs';
import {
  MultiSelectDropdown
} from '../../../shared/components/multi-select-search-dropdown/multi-select-search-dropdown';

@Component({
  selector: 'app-item-view-and-edit',
  imports: [CommonModule, ReactiveFormsModule, MultiSelectDropdown],
  templateUrl: './item-view-and-edit.html',
  styleUrl: './item-view-and-edit.css',
  standalone: true
})
export class ItemViewAndEdit implements OnInit, AfterViewInit, OnChanges {

  @Input() item: ItemTableViewResponseProjection | undefined;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();

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
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadItemNames();
    console.warn('Item data received in ItemViewAndEdit:', this.item);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditModalOpen'] && this.itemForm) {
      this.updateFormMode();
    }

    if (changes['item'] && this.item && this.itemForm) {
      this.patchFormWithData(this.item);
    }
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

    this.updateFormMode();
  }

  ngAfterViewInit(): void {
    if (this.item) {
      this.patchFormWithData(this.item);
    }
  }

  private updateFormMode(): void {
    if (!this.itemForm) {
      return;
    }

    if (this.isEditModalOpen) {
      this.itemForm.enable();
    } else {
      this.itemForm.disable();
    }

    this.cdr.markForCheck();
  }

  private patchFormWithData(data: ItemTableViewResponseProjection): void {
    this.itemForm.patchValue({
      itemName: data.itemName,
      balanceQty: data.balanceQty,
      supplierPrice: data.supplierPrice,
      sellingPrice: data.sellingPrice,
      measuringUnitType: data.measuringUnitType,
      laborActivitiesSelected: data.laborActivities?.map(a => a.laborActivityId) || [],
    }, {emitEvent: false});

    this.cdr.markForCheck();
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: LaborActivityNameResponseProjection[]) => {
        this.laborActivityNameProjection = res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load names', err)
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isEditModalOpen) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting = true;
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

    this.adminService.modifyItem(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
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
    return this.itemForm?.get('laborActivitiesSelected') as FormControl;
  }
}

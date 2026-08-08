import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {MeasuringUnitType} from '../../../shared/enums/measuring-unit-type.enum/MeasuringUnitType';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-item-form',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MultiSelectDropdown,
    NgForOf
  ],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css',
})
export class ItemForm implements OnInit {

  @Output() cancel = new EventEmitter<void>();

  itemForm!: FormGroup;
  laborActivityNameProjection: LaborActivityNameProjection[] = [];
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
  }

  initForm(): void {
    this.itemForm = this.fb.group({
      itemName: ['', Validators.required],
      balanceQty: [0, [Validators.required, Validators.min(0)]],
      supplierPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      measuringUnitType: ['', Validators.required] ,// e.g., 'PIECES', 'LITERS'
      laborActivitiesSelected: [[], Validators.required]
    });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: LaborActivityNameProjection[]) => {
        this.laborActivityNameProjection = res;
      },
      error: (err: any) => console.error('Failed to load names', err)
    });
  }

  onSubmit(): void {

    if (this.isSubmitting) {
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
      itemName: formValue.itemName,
      balanceQty: formValue.balanceQty,
      supplierPrice: formValue.supplierPrice,
      sellingPrice: formValue.sellingPrice,
      measuringUnitType: formValue.measuringUnitType,
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
    };

    this.adminService.saveItem(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
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
    return (this.itemForm?.get('laborActivitiesSelected') as FormControl) || new FormControl([]);
  }
}

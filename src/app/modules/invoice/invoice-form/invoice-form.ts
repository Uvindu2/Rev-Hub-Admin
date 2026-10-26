import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

import { LaborActivityNameResponseProjection } from '../../../dto/response/LaborActivityNameResponseProjection';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { InvoiceItemsResponseDTO } from '../../../dto/response/InvoiceItemsResponseDTO';
import { AuthService } from '../../../services/auth.service';
import { JobCardNumberResponseDTO } from '../../../dto/response/PendingJobNumbersDTO';
import { PdfPreviewResponse } from '../../../dto/response/PdfPreviewResponse';
import { ItemSearchDropdown } from '../../../shared/components/item-search-dropdown/item-search-dropdown';
import { SearchDropdown } from '../../../shared/components/search-dropdown/search-dropdown';
import { MeasuringUnitType } from '../../../enum/MeasuringUnitType';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ItemSearchDropdown,
    SearchDropdown
  ],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class InvoiceForm implements OnInit {

  @Output() invoiceGenerated = new EventEmitter<SafeResourceUrl>();

  isLoading = true;
  isSubmitting = false;
  isSearching = false;

  invoiceForm!: FormGroup;
  selectedLaborIndex = 0;

  pendingJobNumbers: JobCardNumberResponseDTO[] = [];
  availableLaborActivities: LaborActivityNameResponseProjection[] = [];
  filteredLaborActivities: LaborActivityNameResponseProjection[] = [];
  availableItemParts: InvoiceItemsResponseDTO[] = [];

  isDropdownOpen = false;
  laborActivityAvailable = false;

  readonly measuringUnitTypes = Object.values(MeasuringUnitType);

  private initialLoadsRemaining = 3;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPendingJobNumbers();
    this.loadItemNames();
    this.loadItemParts();
  }

  // ---------------- FORM ----------------

  initForm(): void {
    this.invoiceForm = this.fb.group({
      laborActivities: this.fb.array([]),
      paymentMethod: ['Cash', Validators.required],
      jobCardSearch: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      additionalFees: [0, [Validators.required, Validators.min(0)]],
      additionalNotes: [''],
      status: ['PAID']
    });
  }

  get laborActivities(): FormArray {
    return this.invoiceForm.get('laborActivities') as FormArray;
  }

  getParts(laborIndex: number): FormArray {
    return this.laborActivities.at(laborIndex).get('parts') as FormArray;
  }

  getPartControls(laborIndex: number): AbstractControl[] {
    return this.getParts(laborIndex).controls;
  }

  getPartFormGroup(laborIndex: number, partIndex: number): FormGroup {
    return this.getParts(laborIndex).at(partIndex) as FormGroup;
  }

  // ---------------- LABOR ACTIVITIES ----------------

  addLaborActivity(
    nameOrId: string | number = '',
    isAuto = false,
    fee = 0
  ): void {
    const isNumeric = nameOrId !== '' && !isNaN(Number(nameOrId));
    const activityId = isNumeric ? Number(nameOrId) : 0;
    const displayTitle = isNumeric ? this.getLaborActivityName(activityId) : nameOrId;

    const laborGroup = this.fb.group({
      id: [activityId],
      name: [displayTitle, Validators.required],
      isAutoFetched: [isAuto],
      laborFee: [fee, [Validators.required, Validators.min(0)]],
      parts: this.fb.array([])
    });

    this.laborActivities.push(laborGroup);
    this.selectedLaborIndex = this.laborActivities.length - 1;
  }

  getLaborActivityName(id: string | number | null | undefined): string {
    if (id === null || id === undefined || id === '') {
      return '';
    }
    const activity = this.availableLaborActivities.find(
      item => String(item.laborActivityId) === String(id)
    );
    return activity?.activityName ?? String(id);
  }

  selectLaborTask(index: number): void {
    this.selectedLaborIndex = index;
    this.isDropdownOpen = false;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filteredLaborActivities = [...this.availableLaborActivities];
    }
  }

  onSearchLaborDropdown(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredLaborActivities = query
      ? this.availableLaborActivities.filter(activity =>
        activity.activityName?.toLowerCase().includes(query)
      )
      : [...this.availableLaborActivities];
  }

  selectActivityOption(activityId: number | string): void {
    const activeGroup = this.laborActivities.at(this.selectedLaborIndex);
    if (activeGroup) {
      activeGroup.patchValue({
        id: Number(activityId),
        name: this.getLaborActivityName(activityId)
      });
    }
    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  removeLaborActivity(index: number, event: Event): void {
    event.stopPropagation();
    if (this.laborActivities.length <= 1) {
      this.notificationService.show(
        'An invoice must contain at least one labor activity.',
        'error'
      );
      return;
    }

    this.laborActivities.removeAt(index);
    if (this.selectedLaborIndex >= this.laborActivities.length) {
      this.selectedLaborIndex = this.laborActivities.length - 1;
    } else if (this.selectedLaborIndex === index) {
      this.selectedLaborIndex = 0;
    }
  }

  // ---------------- PARTS ----------------

  addPartToLabor(
    laborIndex: number,
    name = '',
    qty = 1,
    unitType = '',
    unitPrice = 0,
    itemId: number | null = null,
    supplierPrice = 0
  ): void {
    const partGroup = this.fb.group({
      itemId: [itemId, Validators.required],
      name: [name, Validators.required],
      qty: [qty, [Validators.required, Validators.min(1)]],
      unitType: [unitType, Validators.required],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      supplierPrice: [supplierPrice, [Validators.min(0)]],
      total: [{ value: qty * unitPrice, disabled: true }],
      isManual: [false]
    });

    partGroup.get('itemId')?.valueChanges.subscribe(selectedId => {
      if (selectedId === null || selectedId === undefined) {
        if (!partGroup.get('isManual')?.value) {
          partGroup.patchValue({
            name: '',
            unitType: '',
            unitPrice: 0
          }, { emitEvent: false });
          this.updatePartTotal(partGroup);
        }
        return;
      }

      const item = this.availableItemParts.find(
        part => String(part.itemId) === String(selectedId)
      );

      if (item) {
        console.warn(item)
        partGroup.patchValue({
          name: item.itemName,
          unitType: item.measuringUnitType ?? 'N/A',
          unitPrice: Number(item.sellingPrice ?? 0)
        }, { emitEvent: false });
        this.updatePartTotal(partGroup);
      }
    });

    partGroup.valueChanges.subscribe(() => {
      this.updatePartTotal(partGroup);
    });

    this.getParts(laborIndex).push(partGroup);

    if (itemId !== null) {
      const item = this.availableItemParts.find(
        part => String(part.itemId) === String(itemId)
      );
      if (item) {
        partGroup.patchValue({
          name: item.itemName,
          unitType: item.measuringUnitType ?? '',
          unitPrice: Number(item.sellingPrice ?? 0)
        }, { emitEvent: false });
        this.updatePartTotal(partGroup);
      }
    }
  }

  private updatePartTotal(part: AbstractControl): void {
    const qty = Number(part.get('qty')?.value) || 0;
    const price = Number(part.get('unitPrice')?.value) || 0;
    part.get('total')?.setValue(qty * price, { emitEvent: false });
  }

  removePart(laborIndex: number, partIndex: number): void {
    this.getParts(laborIndex).removeAt(partIndex);
  }

  // ---------------- MANUAL ITEM MODE ----------------

  enableNewItemMode(laborIndex: number, partIndex: number): void {
    const part = this.getPartFormGroup(laborIndex, partIndex);

    part.patchValue({
      isManual: true,
      itemId: null,
      name: '',
      qty: 1,
      unitType: MeasuringUnitType.NUMBER,
      unitPrice: 0,
      supplierPrice: 0,
      total: 0
    }, { emitEvent: false });

    part.get('itemId')?.clearValidators();
    part.get('itemId')?.updateValueAndValidity({ emitEvent: false });

    part.get('name')?.setValidators(Validators.required);
    part.get('unitType')?.setValidators(Validators.required);
    part.get('unitPrice')?.setValidators([Validators.required, Validators.min(0)]);
    part.get('supplierPrice')?.setValidators([Validators.required, Validators.min(0)]);

    part.get('name')?.enable();
    part.get('qty')?.enable();
    part.get('unitType')?.enable();
    part.get('unitPrice')?.enable();
    part.get('supplierPrice')?.enable();

    part.get('name')?.updateValueAndValidity({ emitEvent: false });
    part.get('unitType')?.updateValueAndValidity({ emitEvent: false });
    part.get('unitPrice')?.updateValueAndValidity({ emitEvent: false });
    part.get('supplierPrice')?.updateValueAndValidity({ emitEvent: false });

    this.cdr.markForCheck();
  }

  // ---------------- TOTALS ----------------

  get totalPartsCost(): number {
    let total = 0;
    this.laborActivities.controls.forEach((_, laborIndex) => {
      this.getParts(laborIndex).controls.forEach(part => {
        const qty = Number(part.get('qty')?.value) || 0;
        const price = Number(part.get('unitPrice')?.value) || 0;
        total += qty * price;
      });
    });
    return total;
  }

  get totalLaborCost(): number {
    return this.laborActivities.controls.reduce(
      (total, labor) => total + (Number(labor.get('laborFee')?.value) || 0),
      0
    );
  }

  get grandTotal(): number {
    return this.totalPartsCost +
      this.totalLaborCost +
      (Number(this.invoiceForm.get('additionalFees')?.value) || 0);
  }

  // ---------------- INITIAL DATA ----------------

  private finishInitialLoad(): void {
    this.initialLoadsRemaining--;
    if (this.initialLoadsRemaining <= 0) {
      this.isLoading = false;
    }
    this.cdr.markForCheck();
  }

  loadPendingJobNumbers(): void {
    this.adminService.getPendingJobNumbers()
      .pipe(finalize(() => this.finishInitialLoad()))
      .subscribe({
        next: (res: any) => {
          this.pendingJobNumbers = res?.data ?? res ?? [];
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load pending job numbers:', err);
        }
      });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames()
      .pipe(finalize(() => this.finishInitialLoad()))
      .subscribe({
        next: (res: any) => {
          this.availableLaborActivities = res?.data ?? res ?? [];
          this.filteredLaborActivities = [...this.availableLaborActivities];
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load labor activity names:', err);
        }
      });
  }

  loadItemParts(): void {
    this.adminService.getInvoiceItems()
      .pipe(finalize(() => this.finishInitialLoad()))
      .subscribe({
        next: (res: any) => {
          this.availableItemParts = res?.data ?? res ?? [];
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load invoice items:', err);
        }
      });
  }

  // ---------------- JOB CARD SEARCH ----------------

  onJobCardSearchClick(): void {
    const jobControl = this.invoiceForm.get('jobCardSearch');
    if (!jobControl?.valid) {
      jobControl?.markAsTouched();
      jobControl?.markAsDirty();
      this.notificationService.show('Please select a valid job number.', 'warning');
      return;
    }

    if (this.isSearching) {
      return;
    }

    this.isSearching = true;

    this.adminService.getLaborActivitiesByJobId(jobControl.value)
      .pipe(finalize(() => {
        this.isSearching = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res: any) => {
          this.laborActivities.clear();
          const activities = res?.data ?? [];
          if (activities.length === 0) {
            this.laborActivityAvailable = false;
            this.notificationService.show('No labor activities were found for this job card.', 'error');
            return;
          }
          this.laborActivityAvailable = true;
          activities.forEach((activity: any) => {
            this.addLaborActivity(activity.laborActivityId, true, 0);
          });
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Job card search error:', err);
          this.notificationService.show('Error: ' + (err?.error?.response || 'Please try again later.'), 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ---------------- SUBMIT ----------------

  onSubmit(): void {
    if (this.laborActivities.length < 1) {
      this.notificationService.show('An invoice must contain at least one labor activity.', 'error');
      return;
    }

    if (this.invoiceForm.invalid) {
      this.markAllAsTouched(this.invoiceForm);
      this.notificationService.show('Please resolve all validation errors before proceeding.', 'error');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const payload = this.invoiceForm.getRawValue();

    this.adminService.saveInvoice(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res: any) => {
          const pdfResponse: PdfPreviewResponse = res?.data?.pdfPreviewResponseDTO ?? res?.data ?? res;
          if (!pdfResponse?.id) {
            this.notificationService.show('Invoice was saved, but the invoice ID was not returned.', 'error');
            return;
          }
          this.notificationService.show(res?.response || 'Invoice generated successfully!', 'success');
          this.router.navigate(['/dashboard/pdf-preview', 'invoice', pdfResponse.id]);
        },
        error: (err: any) => {
          console.error('Invoice submission error:', err);
          const message = err?.error?.data?.error || err?.error?.response || err?.error?.message || 'Unable to save the invoice.';
          this.notificationService.show('Error: ' + message, 'error');
        }
      });
  }

  private markAllAsTouched(group: FormGroup | FormArray): void {
    Object.values(group.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/invoices']);
  }

  get selectedLaborActivity(): FormGroup {
    return this.laborActivities.at(this.selectedLaborIndex) as FormGroup;
  }

  get hasManualParts(): boolean {
    const parts = this.getParts(this.selectedLaborIndex);
    return parts.controls.some(part => part.get('isManual')?.value);
  }
}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {LaborActivityNameResponseProjection} from '../../../dto/response/LaborActivityNameResponseProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {InvoiceItemsResponseDTO} from '../../../dto/response/InvoiceItemsResponseDTO';
import {finalize} from 'rxjs';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-form.css',
})
export class InvoiceForm implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() invoiceGenerated = new EventEmitter<SafeResourceUrl>();

  invoiceForm!: FormGroup;
  selectedLaborIndex: number = 0;

  availableLaborActivities: LaborActivityNameResponseProjection[] = [];
  filteredLaborActivities: LaborActivityNameResponseProjection[] = [];
  availableItemParts: InvoiceItemsResponseDTO[] = [];

  // State management properties for the tabular parts searchable dropdown matrix
  partDropdownOpenRowIndex: number | null = null;
  filteredItemParts: InvoiceItemsResponseDTO[] = [];
  isDropdownOpen: boolean = false;
  laborActivityAvailable = false;

  // Submission & Print Preview Modal states
  isSubmitting: boolean = false;
  showPrintPreviewModal: boolean = false;
  invoicePdfUrl: SafeResourceUrl | null = null;

  isSearching: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadItemNames();
    this.loadItemParts();
  }

  initForm() {
    this.invoiceForm = this.fb.group({
      laborActivities: this.fb.array([]),
      paymentMethod: ['Cash', Validators.required],
      jobCardSearch: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      additionalFees: [0, [Validators.required, Validators.min(0)]],
      additionalNotes: [''],
      status: ['PAID'],
    });
  }

  get laborActivities(): FormArray {
    return this.invoiceForm.get('laborActivities') as FormArray;
  }

  getParts(laborIndex: number): FormArray {
    return this.laborActivities.at(laborIndex).get('parts') as FormArray;
  }

  getPartControls(laborIndex: number): AbstractControl[] {
    const partsArray = this.getParts(laborIndex);
    return partsArray ? partsArray.controls : [];
  }

  addLaborActivity(nameOrId: string | number = '', isAuto: boolean = false, fee: number = 0) {
    const isNumeric = !isNaN(Number(nameOrId)) && nameOrId !== '';
    const activityId = isNumeric ? Number(nameOrId) : 0;
    const displayTitle = isNumeric ? this.getLaborActivityName(activityId) : nameOrId;

    const laborGroup = this.fb.group({
      id: [activityId],
      name: [displayTitle, Validators.required],
      isAutoFetched: [isAuto],
      laborFee: [fee, [Validators.required, Validators.min(0)]],
      parts: this.fb.array([]),
    });

    this.laborActivities.push(laborGroup);
    this.selectedLaborIndex = this.laborActivities.length - 1;
  }

  getLaborActivityName(id: string | number | null | undefined): string {
    if (id === null || id === undefined || id === '') return '';
    const activity = this.availableLaborActivities?.find(
      (act) => act.laborActivityId?.toString() === id.toString(),
    );
    return activity ? activity.activityName : id.toString();
  }

  addPartToLabor(
    laborIndex: number,
    name: string = '',
    qty: number = 1,
    unitType: string = 'N/A',
    unitPrice: number = 0,
    itemId: number | null = null,
  ) {
    const partGroup = this.fb.group({
      itemId: [itemId, Validators.required],
      name: [name, Validators.required],
      qty: [qty, [Validators.required, Validators.min(1)]],
      unitType: [unitType],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      total: [{value: qty * unitPrice, disabled: true}],
    });

    const qty$ = partGroup.get('qty')?.valueChanges;
    const price$ = partGroup.get('unitPrice')?.valueChanges;

    if (qty$ && price$) {
      partGroup.valueChanges.subscribe(() => {
        const currentQty = partGroup.get('qty')?.value || 0;
        const currentPrice = partGroup.get('unitPrice')?.value || 0;
        partGroup.get('total')?.setValue(currentQty * currentPrice, {emitEvent: false});
      });
    }

    this.getParts(laborIndex).push(partGroup);
  }

  removePart(laborIndex: number, partIndex: number) {
    this.getParts(laborIndex).removeAt(partIndex);
    if (this.partDropdownOpenRowIndex === partIndex) {
      this.partDropdownOpenRowIndex = null;
    }
  }

  selectPartOption(rowIndex: number, item: any): void {
    const partsArray = this.getParts(this.selectedLaborIndex);
    const currentRow = partsArray?.at(rowIndex);
    if (item && currentRow) {
      currentRow.patchValue({
        itemId: item.itemId || item.id,
        name: item.itemName,
        unitType: item.unitType || 'N/A',
        unitPrice: item.sellingPrice,
      });
    }

    this.partDropdownOpenRowIndex = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  selectLaborTask(index: number) {
    this.selectedLaborIndex = index;
    this.partDropdownOpenRowIndex = null;
  }

  get totalPartsCost(): number {
    let sum = 0;
    this.laborActivities.controls.forEach((_, lIdx) => {
      this.getParts(lIdx).controls.forEach((p) => {
        sum += (p.get('qty')?.value || 0) * (p.get('unitPrice')?.value || 0);
      });
    });
    return sum;
  }

  get totalLaborCost(): number {
    return this.laborActivities.controls.reduce(
      (acc, curr) => acc + (curr.get('laborFee')?.value || 0),
      0,
    );
  }

  get grandTotal(): number {
    return (
      this.totalPartsCost +
      this.totalLaborCost +
      (this.invoiceForm.get('additionalFees')?.value || 0)
    );
  }

  onSubmit() {
    // 1. Fetch current logged-in user details from your auth service
    const currentUser = this.authService.getCurrentUser();
    console.log(currentUser);
    if (this.laborActivities.length < 1) {
      this.notificationService.show(
        'An invoice must contain at least one labor activity.',
        'error',
      );
      return;
    }
    if (this.invoiceForm.invalid) {
      this.markAllAsTouched(this.invoiceForm);
      this.notificationService.show(
        'Please resolve all validation errors before proceeding.',
        'error',
      );
      return;
    }

    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.cdr.markForCheck();

    const payload = this.invoiceForm.getRawValue();

    this.adminService
      .saveInvoice(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res: any) => {
          const dataContainer = res?.data || res;

          // Check if pdfBytes base64 string exists in backend response
          if (dataContainer && dataContainer.pdfBytes) {
            this.notificationService.show(
              dataContainer.response || 'Invoice generated and posted successfully!',
              'success',
            );

            // Decode the Base64 string into a binary array for the PDF blob
            const base64String = dataContainer.pdfBytes;
            const binaryString = window.atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], {type: 'application/pdf'});
            const unsafeUrl = window.URL.createObjectURL(blob);

            // Bypass security to make it safe for iframe binding in the modal
            const safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

            // Reset form state & emit URL to parent (InvoiceView) to close form & open custom print modal
            this.resetFormState();
            this.invoiceGenerated.emit(safePdfUrl);
          } else {
            this.notificationService.show(
              'Failed to parse invoice transaction or missing PDF data.',
              'error',
            );
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Submission crash details:', err);
          const serverErrorMessage =
            err.error?.data?.error || 'Database constraint violation encountered.';

          this.notificationService.show('Error: ' + serverErrorMessage, 'error');
          this.cdr.markForCheck();
        },
      });
  }

  private resetFormState() {
    this.invoiceForm.reset({
      paymentMethod: 'Cash',
      jobCardSearch: '',
      additionalFees: 1500,
      status: 'PENDING',
    });
    this.laborActivities.clear();
    this.selectedLaborIndex = 0;
    this.partDropdownOpenRowIndex = null;
    this.cdr.detectChanges();
  }

  private markAllAsTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  removeLaborActivity(index: number, event: Event) {
    event.stopPropagation();
    if (this.laborActivities.length <= 1) {
      this.notificationService.show(
        'An invoice must contain at least one labor activity.',
        'error',
      );
      return;
    }

    this.laborActivities.removeAt(index);
    this.partDropdownOpenRowIndex = null;

    if (this.selectedLaborIndex >= this.laborActivities.length) {
      this.selectedLaborIndex = this.laborActivities.length - 1;
    } else if (this.selectedLaborIndex === index) {
      this.selectedLaborIndex = 0;
    }
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: any) => {
        const dataPayload = res?.data ? res.data : res;
        this.availableLaborActivities = dataPayload || [];
        this.filteredLaborActivities = [...this.availableLaborActivities];
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load names', err),
    });
  }

  loadItemParts(): void {
    this.adminService.getInvoiceItems().subscribe({
      next: (res: any) => {
        this.availableItemParts = res?.data || [];
        this.filteredItemParts = [...this.availableItemParts];
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load item parts', err),
    });
  }

  onSearchLaborDropdown(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!query) {
      this.filteredLaborActivities = [...this.availableLaborActivities];
      return;
    }
    this.filteredLaborActivities = this.availableLaborActivities.filter((act) =>
      act.activityName?.toLowerCase().includes(query),
    );
  }

  onJobCardSearchClick(): void {
    const value = this.invoiceForm.get('jobCardSearch')?.value;
    if (!value) return;
    if (!this.invoiceForm.get('jobCardSearch')?.valid) {
      this.notificationService.show('Please fill out all required job card number field.', 'warning');
      return;
    }
    this.adminService.getLaborActivitiesByJobId(value).subscribe({
      next: (res: any) => {
        this.laborActivities.clear();
        this.partDropdownOpenRowIndex = null;
        const incomingActivities = res?.data || [];

        if (incomingActivities.length === 0) {
          this.laborActivityAvailable = false;
          this.notificationService.show('No Job Card found with that Job Id.', 'error');
          this.cdr.detectChanges();
          return;
        }

        this.laborActivityAvailable = true;
        incomingActivities.forEach((activity: any) => {
          this.addLaborActivity(activity.laborActivityId, true, 0);
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('crash error:', err);
        const serverErrorMessage =
          err.error?.response || 'Please try again later. if not please contact System Administrator.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filteredLaborActivities = [...this.availableLaborActivities];
    }
  }

  selectActivityOption(activityId: number | string): void {
    const activeGroup = this.laborActivities.at(this.selectedLaborIndex);
    const resolvedName = this.getLaborActivityName(activityId);

    if (activeGroup) {
      activeGroup.patchValue({
        id: Number(activityId),
        name: resolvedName,
      });
    }

    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  togglePartDropdown(event: Event, rowIndex: number): void {
    event.stopPropagation();
    this.partDropdownOpenRowIndex = this.partDropdownOpenRowIndex === rowIndex ? null : rowIndex;
    if (this.partDropdownOpenRowIndex !== null) {
      this.filteredItemParts = [...this.availableItemParts];
    }
  }

  onSearchPartsDropdown(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!query) {
      this.filteredItemParts = [...this.availableItemParts];
      return;
    }
    this.filteredItemParts = this.availableItemParts.filter((p) =>
      p.itemName?.toLowerCase().includes(query),
    );
  }
}

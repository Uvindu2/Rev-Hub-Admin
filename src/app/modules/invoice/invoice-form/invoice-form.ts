import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {ItemProjection} from '../../../dto/response/ItemProjection';
import { finalize } from 'rxjs';

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

  invoiceForm!: FormGroup;
  selectedLaborIndex: number = 0;

  protected availableLaborActivities: LaborActivityNameProjection[] = [];
  protected filteredLaborActivities: LaborActivityNameProjection[] = [];
  protected availableItemParts: ItemProjection[] = [];

  // State management properties for the tabular parts searchable dropdown matrix
  protected partDropdownOpenRowIndex: number | null = null;
  protected filteredItemParts: ItemProjection[] = [];
  protected isDropdownOpen: boolean = false;
  protected laborActivityAvailable = false;
  
  // Submission & Print Preview Modal states
  protected isSubmitting: boolean = false;
  protected showPrintPreviewModal: boolean = false;
  protected invoicePdfUrl: SafeResourceUrl | null = null;
isSearching: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadItemNames();
    this.loadItemParts();
  }

  initForm() {
    this.invoiceForm = this.fb.group({
      laborActivities: this.fb.array([]),
      paymentMethod: ['Cash', Validators.required],
      jobCardSearch: ['', Validators.required],
      additionalFees: [1500, [Validators.required, Validators.min(0)]],
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
      parts: this.fb.array([])
    });

    this.laborActivities.push(laborGroup);
    this.selectedLaborIndex = this.laborActivities.length - 1;
  }

  getLaborActivityName(id: string | number | null | undefined): string {
    if (id === null || id === undefined || id === '') return '';
    const activity = this.availableLaborActivities?.find(
      act => act.laborActivityId?.toString() === id.toString()
    );
    return activity ? activity.activityName : id.toString();
  }

  addPartToLabor(laborIndex: number, name: string = '', qty: number = 1, unitPrice: number = 0, itemId: number | null = null) {
    const partGroup = this.fb.group({
      itemId: [itemId, Validators.required],
      name: [name, Validators.required],
      qty: [qty, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      total: [{value: qty * unitPrice, disabled: true}]
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
        unitPrice: item.sellingPrice
      });
    }

    this.partDropdownOpenRowIndex = null;
    this.cdr.markForCheck();
  }

  selectLaborTask(index: number) {
    this.selectedLaborIndex = index;
    this.partDropdownOpenRowIndex = null;
  }

  get totalPartsCost(): number {
    let sum = 0;
    this.laborActivities.controls.forEach((_, lIdx) => {
      this.getParts(lIdx).controls.forEach(p => {
        sum += (p.get('qty')?.value || 0) * (p.get('unitPrice')?.value || 0);
      });
    });
    return sum;
  }

  get totalLaborCost(): number {
    return this.laborActivities.controls.reduce((acc, curr) => acc + (curr.get('laborFee')?.value || 0), 0);
  }

  get grandTotal(): number {
    return this.totalPartsCost + this.totalLaborCost + (this.invoiceForm.get('additionalFees')?.value || 0);
  }

  onSubmit() {
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

    this.adminService.saveInvoice(payload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        const dataContainer = res?.data || res;

        if (dataContainer && dataContainer.pdfBytes) {
          this.notificationService.show(
            dataContainer.response || 'Invoice generated and posted successfully!',
            'success'
          );
          this.printInvoice(res.data.invoiceId);
          this.resetFormState();
        } else {
          this.notificationService.show(
            'Failed to parse invoice transaction or missing PDF data.',
            'error'
          );
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Submission crash details:', err);
        const serverErrorMessage =
          err.error?.data?.error || 'Database constraint violation encountered.';

        this.notificationService.show(
          'Error: ' + serverErrorMessage,
          'error'
        );
        this.cdr.markForCheck();
      }
    });
  }

    printInvoice(invoiceId: number): void {
    this.adminService.viewInvoice(invoiceId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
      },
      error: () => {
        this.notificationService.show('Failed to print invoice', 'error');
      }
    });
  }

  private resetFormState() {
    this.invoiceForm.reset({
      paymentMethod: 'Cash',
      jobCardSearch: '',
      additionalFees: 1500,
      status: 'PENDING'
    });
    this.laborActivities.clear();
    this.selectedLaborIndex = 0;
    this.partDropdownOpenRowIndex = null;
    this.cdr.detectChanges();
  }

  private markAllAsTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
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
      this.notificationService.show('An invoice must contain at least one labor activity.', 'error');
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
      error: (err: any) => console.error('Failed to load names', err)
    });
  }

  loadItemParts(): void {
    this.adminService.getItemParts().subscribe({
      next: (res: any) => {
        this.availableItemParts = res?.data || [];
        this.filteredItemParts = [...this.availableItemParts];
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load item parts', err)
    });
  }

  onSearchLaborDropdown(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!query) {
      this.filteredLaborActivities = [...this.availableLaborActivities];
      return;
    }
    this.filteredLaborActivities = this.availableLaborActivities.filter(act =>
      act.activityName?.toLowerCase().includes(query)
    );
  }

  onJobCardSearchClick(): void {
    const value = this.invoiceForm.get('jobCardSearch')?.value;
    if (!value) return;

    this.adminService.getLaborActivitiesByJobId(value).subscribe({
      next: (res: any) => {
        this.laborActivities.clear();
        this.partDropdownOpenRowIndex = null;
        const incomingActivities = res?.data || [];
        this.laborActivityAvailable = true;

        if (incomingActivities.length === 0) {
          this.notificationService.show('No activities linked to this Job Card.', 'error');
          this.cdr.detectChanges();
          return;
        }

        incomingActivities.forEach((activity: any) => {
          this.addLaborActivity(activity.laborActivityId, true, 0);
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.show('No Job Card found with that Job Id.', 'error');
        this.cdr.detectChanges();
      }
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
        name: resolvedName
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
    this.filteredItemParts = this.availableItemParts.filter(p =>
      p.itemName?.toLowerCase().includes(query)
    );
  }

  onCancel() {
    this.cancel.emit();
  }
}

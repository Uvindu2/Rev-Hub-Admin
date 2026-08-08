import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {ItemProjection} from '../../../dto/response/ItemProjection';
import {finalize} from 'rxjs';

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
  protected isSubmitting = false;
  protected isSearching = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly http: HttpClient
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

  onSubmit(): void {

    console.log(this.laborActivities.length);

    // =========================================================
    // VALIDATE LABOR ACTIVITIES
    // =========================================================

    if (this.laborActivities.length < 1) {

      this.notificationService.show(
        'An invoice must contain at least one labor activity.',
        'error'
      );

      return;
    }


    // =========================================================
    // VALIDATE FORM
    // =========================================================

    if (this.invoiceForm.invalid) {

      this.markAllAsTouched(this.invoiceForm);

      this.notificationService.show(
        'Please resolve all validation errors before proceeding.',
        'error'
      );

      return;
    }


    // =========================================================
    // PREVENT DOUBLE SUBMISSION
    // =========================================================

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;


    // =========================================================
    // OPEN PDF TAB IMMEDIATELY
    // =========================================================

    const viewerTab =
      window.open('about:blank', '_blank');


    if (viewerTab) {

      viewerTab.document.write(
        'Generating Invoice PDF, please wait...'
      );

    }


    // =========================================================
    // GET FORM PAYLOAD
    // =========================================================

    const payload =
      this.invoiceForm.getRawValue();


    // =========================================================
    // SAVE INVOICE
    // =========================================================

    this.adminService.saveInvoice(payload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      // =======================================================
      // SUCCESS
      // =======================================================
      next: (res) => {

        if (res.code === 200 || res.success) {
          this.notificationService.show(
            'Invoice generated and posted successfully!',
            'success'
          );

          // ===================================================
          // PDF DATA
          // ===================================================

          const dataContainer =
            res.data;

          if (dataContainer && dataContainer.pdfBytes) {
            try {

              // Remove whitespace from Base64
              const cleanBase64 =
                dataContainer.pdfBytes.replace(/\s/g, '');


              // Base64 -> Binary
              const binaryCharacters =
                atob(cleanBase64);


              const binaryLength =
                binaryCharacters.length;


              const numericBytes =
                new Uint8Array(binaryLength);


              for (
                let i = 0;
                i < binaryLength;
                i++
              ) {

                numericBytes[i] =
                  binaryCharacters.charCodeAt(i);

              }


              // =================================================
              // CREATE PDF BLOB
              // =================================================

              const invoiceBlob =
                new Blob(
                  [numericBytes],
                  {
                    type: 'application/pdf'
                  }
                );


              const currentBlobUrl =
                window.URL.createObjectURL(
                  invoiceBlob
                );


              // =================================================
              // OPEN PDF IN EXISTING TAB
              // =================================================

              if (viewerTab) {

                viewerTab.location.href =
                  currentBlobUrl;

              }


              // =================================================
              // CLEAN BLOB URL
              // =================================================

              setTimeout(() => {

                window.URL.revokeObjectURL(
                  currentBlobUrl
                );

              }, 6000);


            } catch (decodeErr) {

              console.error(
                'Binary compilation breakdown:',
                decodeErr
              );


              if (viewerTab) {
                viewerTab.close();
              }


              this.notificationService.show(
                'Warning: Transaction processed, but unable to compile invoice layout.',
                'error'
              );

            }

          } else {

            // No PDF returned
            if (viewerTab) {
              viewerTab.close();
            }

          }


          // ===================================================
          // RESET FORM
          // ===================================================

          this.resetFormState();

          this.cancel.emit();

        }

          // =====================================================
          // BACKEND RETURNED FAILURE
        // =====================================================

        else {
          if (viewerTab) {
            viewerTab.close();
          }


          this.notificationService.show(
            res.message ||
            'Failed to parse invoice transaction.',
            'error'
          );

        }

      },


      // =======================================================
      // HTTP ERROR
      // =======================================================

      error: (err) => {

        console.error(
          'Submission crash details:',
          err
        );


        if (viewerTab) {
          viewerTab.close();
        }


        const serverErrorMessage =
          err.error?.data?.error ||
          'Database constraint violation encountered.';


        this.notificationService.show(
          'Error: ' + serverErrorMessage,
          'error'
        );

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
    if (this.isSearching) {
      return;
    }

    this.isSearching = true;

    this.adminService.getLaborActivitiesByJobId(value).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSearching = false;
      })).subscribe({
      next: (res: any) => {
        this.laborActivities.clear();
        this.partDropdownOpenRowIndex = null;
        const incomingActivities = res?.data || [];
        this.laborActivityAvailable = true;

        if (incomingActivities.length === 0) {
          this.isSearching = false;
          this.notificationService.show('No activities linked to this Job Card.', 'error');
          this.cdr.detectChanges();
          return;
        }

        incomingActivities.forEach((activity: any) => {
          this.addLaborActivity(activity.laborActivityId, true, 0);
        });
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSearching = false;
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

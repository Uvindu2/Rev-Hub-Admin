import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { VehicleAndCustomerDTO } from '../../../dto/response/VehicleAndCustomerDTO';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import { TechnicianNameProjection } from '../../../dto/response/TechnicianNameProjection';
import { LaborActivityNameProjection } from '../../../dto/response/LaborActivityNameProjection';
import { NotificationService } from '../../../services/notificationService';
import { CustomerProjection } from '../../../dto/response/CustomerProjection';
import { finalize } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-job-card-form',
  templateUrl: './job-card-form.html',
  styleUrls: ['./job-card-form.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatOptionModule, MultiSelectDropdown],
})
export class JobCardForm implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() jobCardGenerated = new EventEmitter<SafeResourceUrl>();
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  jobCardForm!: FormGroup;

  customer: CustomerProjection | undefined;
  vehicleAndCustomerDTO: VehicleAndCustomerDTO | undefined;

  isDropdownOpen = false;
  isExistingVehicle = true;
  isExistingCustomer = true;
  hasSearchedVehicle = false;
  hasSearchedCustomer = false;
  vehicleNotFound = false;
  vehicleFound = false;
  customerNotFound = false;
  customerFound = false;
  isSubmitting = false;
  isSearchingRegVehicle = false;
  isSearchingUnRegVehicle = false;
  isSearchingCustomer = false;

  technicianNameProjection: TechnicianNameProjection[] = [];
  laborActivityNameProjection: LaborActivityNameProjection[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.isExistingVehicle = true;
    this.initForm();
    this.setupFormListeners();
    this.loadItemNames();
    this.loadTechnicianNames();
  }

  loadTechnicianNames(): void {
    this.adminService.getTechnicianNames().subscribe({
      next: (res: TechnicianNameProjection[]) => {
        this.technicianNameProjection = res;
      },
      error: (err: any) => console.error(err),
    });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: LaborActivityNameProjection[]) => {
        this.laborActivityNameProjection = res;
      },
      error: (err: any) => console.error('Failed to load names', err),
    });
  }

  initForm(): void {
    this.jobCardForm = this.fb.group({
      vehicleRegStatus: ['registered'],
      vehicleSearch: ['', Validators.required],
      unRegVehicleSearch: [''],
      customerSearch: ['', Validators.required],
      entryMode: ['new'],

      // Vehicle specification fields initialized without required validation until search resolves
      vehicleRegNo: ['N/A'],
      vehicleVinNo: ['N/A'],
      make: [''],
      model: [''],
      year: [''],
      colour: [''],
      otherSpecs: [''],

      customerName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      drivingLicenseNumber: [''],
      complaint: ['', Validators.required],

      laborActivitiesSelected: [[], Validators.required],
      assignedTechniciansSelected: [[], Validators.required],
      currentMileage: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (!this.hasSearchedVehicle) {
      this.notificationService.show(
        'Please search and verify the vehicle number before submitting the job card.',
        'warning',
      );
      return;
    }
    const vehicleFields = ['vehicleRegNo', 'make', 'model', 'year'];
    const isVehicleInvalid = vehicleFields.some((field) => this.jobCardForm.get(field)?.invalid);
    if (isVehicleInvalid) {
      vehicleFields.forEach((field) => this.jobCardForm.get(field)?.markAsTouched());
      this.notificationService.show(
        'Please fill out all required vehicle specification fields.',
        'warning',
      );
      return;
    }

    if (!this.hasSearchedCustomer) {
      this.notificationService.show(
        'Please search and verify the customer contact number before submitting the job card.',
        'warning',
      );
      return;
    }

    // 1. Trigger validations across ALL controls
    if (this.jobCardForm.invalid) {
      this.jobCardForm.markAllAsTouched();
      this.notificationService.show(
        'Please fill out all required fields before submitting.',
        'warning',
      );
      return;
    }
    this.isSubmitting = true;
    const formValue = this.jobCardForm.value;

    // 2. Construct backend payload
    const backendPayload = {
      dateAdded: new Date().toISOString(),
      estimatedCompletionTime: null,
      status: 'PENDING',
      customerComplaintText: formValue.complaint,
      currentMileage: formValue.currentMileage,
      existVehicle: formValue.entryMode === 'existing',
      customerSaveRequestDTO: {
        customerName: formValue.customerName,
        email: formValue.email,
        drivingLicenseNumber: formValue.drivingLicenseNumber,
        contactNumber: formValue.contactNumber,
      },
      vehicleSaveRequestDTO: {
        vehicleRegNo: formValue.vehicleRegNo,
        vehicleVinNo: formValue.vehicleVinNo,
        vehicleMake: formValue.make,
        vehicleModel: formValue.model,
        vehicleYear: formValue.year,
        colour: formValue.colour,
        otherSpecs: formValue.otherSpecs,
      },
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
      assignedTechniciansSelected: formValue.assignedTechniciansSelected || [],
    };

    // 3. Dispatch payload request
    this.adminService
      .saveJobCardBlobVariant(backendPayload)
      .pipe(
        // Always reset submit loader
        // success OR error
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.notificationService.show('Job Card saved successfully!', 'success');

          if (res.data) {
            this.notificationService.show('Invoice generated and posted successfully!', 'success');
            const base64String = res.data.replace(/\s/g, '');
            const binaryString = window.atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: 'application/pdf' });
            const unsafeUrl = window.URL.createObjectURL(blob);

            // Bypass security to make it safe for iframe binding in the modal
            const safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

            // Reset form state & emit URL to parent (InvoiceView) to close form & open custom print modal
            //  this.resetFormState();
            this.jobCardGenerated.emit(safePdfUrl);
          } else {
            this.notificationService.show(
              'Failed to parse job card data or missing PDF data.',
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

  onCancel(): void {
    this.cancel.emit();
  }

  onCustomerSearchClick(): void {
    if (this.isSearchingCustomer) {
      return;
    }
    this.customerNotFound = false;
    this.customerFound = false;
    const customerFields = ['customerName', 'email', 'contactNumber', 'drivingLicenseNumber'];
    customerFields.forEach((field) => this.jobCardForm.get(field)?.reset());
    const value = this.jobCardForm.get('customerSearch')?.value;

    if (!value) {
      this.notificationService.show('Please type a customer contact number first.', 'warning');
      return;
    }
    this.hasSearchedCustomer = true;
    this.isSearchingCustomer = true;
    this.adminService
      .getCustomerByContactNumber(value)
      .pipe(
        // Always reset submit loader
        // success OR error
        finalize(() => {
          this.isSearchingCustomer = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.customerFound = true;
          this.customer = res.data;
          this.isExistingCustomer = true;
          this.jobCardForm.patchValue({
            contactNumber: this.customer?.contactNumber || value,
            customerName: this.customer?.customerName,
            email: this.customer?.email,
            drivingLicenseNumber: this.customer?.drivingLicenseNumber,
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          setTimeout(() => {
            this.customerNotFound = true;
            console.log(err);
            this.jobCardForm.patchValue({
              contactNumber: this.customer?.contactNumber || value,
            });
            this.isExistingCustomer = false;
            console.warn('No Customer found with that contact number.');
            this.cdr.detectChanges();
          }, 0);
        },
      });
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('click', ['$event'])
  onInsideClick(event: Event) {
    event.stopPropagation();
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return (this.jobCardForm?.get('laborActivitiesSelected') as FormControl) || new FormControl([]);
  }

  get assignedTechniciansSelectedControl(): FormControl {
    return (
      (this.jobCardForm?.get('assignedTechniciansSelected') as FormControl) || new FormControl([])
    );
  }

  isInvalid(controlName: string): boolean {
    const control = this.jobCardForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private setupFormListeners(): void {
    this.jobCardForm.get('vehicleRegStatus')?.valueChanges.subscribe((status) => {
      this.hasSearchedVehicle = false;
      const currentRegSearch = this.jobCardForm.get('vehicleSearch')?.value?.trim();
      const currentUnRegSearch = this.jobCardForm.get('unRegVehicleSearch')?.value?.trim();

      if (status === 'registered') {
        this.jobCardForm.patchValue(
          {
            unRegVehicleSearch: '',
            vehicleRegNo: currentRegSearch || 'N/A',
            vehicleVinNo: 'N/A',
            entryMode: 'new',
          },
          { emitEvent: false },
        );
      } else {
        this.jobCardForm.patchValue(
          {
            vehicleSearch: '',
            vehicleRegNo: 'N/A',
            vehicleVinNo: currentUnRegSearch || 'N/A',
            entryMode: 'new',
          },
          { emitEvent: false },
        );
      }
      this.isExistingVehicle = false;
    });
  }

  onVehicleSearchClick(): void {
    if (this.isSearchingRegVehicle) {
      return;
    }
    this.vehicleFound = false;
    this.vehicleNotFound = false;
    const currentSearchValue = this.jobCardForm.get('vehicleSearch')?.value?.trim();
    if (!currentSearchValue || currentSearchValue == '') {
      this.notificationService.show('Please enter a vehicle registration number first.', 'warning');
      return;
    }
    this.hasSearchedVehicle = true;
    this.isSearchingRegVehicle = true;
    this.adminService
      .getVehicleAndCustomerByVehicleRegNumber(currentSearchValue)
      .pipe(
        // Always reset submit loader
        // success OR error
        finalize(() => {
          this.isSearchingRegVehicle = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.vehicleFound = true;
          this.handleVehicleLookupSuccess(res, currentSearchValue, 'registered');
        },
        error: (err) => {
          this.vehicleNotFound = true;
          console.error(err);
          this.handleVehicleLookupError(currentSearchValue, 'registered');
        },
      });
  }

  onUnRegVehicleSearchClick(): void {
    if (this.isSearchingUnRegVehicle) {
      return;
    }
    this.vehicleFound = false;
    this.vehicleNotFound = false;
    const currentSearchValue = this.jobCardForm.get('unRegVehicleSearch')?.value?.trim();
    if (!currentSearchValue) {
      this.notificationService.show('Please enter a vehicle VIN number first.', 'warning');
      return;
    }
    this.hasSearchedVehicle = true;
    this.isSearchingUnRegVehicle = true;
    this.adminService
      .getVehicleAndCustomerByVehicleVinNumber(currentSearchValue)
      .pipe(
        // Always reset submit loader
        // success OR error
        finalize(() => {
          this.isSearchingUnRegVehicle = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.vehicleFound = true;
          this.handleVehicleLookupSuccess(res, currentSearchValue, 'unregistered');
        },
        error: (err) => {
          this.vehicleNotFound = true;
          console.error(err);
          this.handleVehicleLookupError(currentSearchValue, 'unregistered');
        },
      });
  }

  private handleVehicleLookupSuccess(res: any, searchValue: string, status: string): void {
    this.vehicleAndCustomerDTO = res;
    this.isExistingVehicle = true;

    // Clear required validators for auto-filled existing data
    ['make', 'model', 'year', 'vehicleRegNo', 'vehicleVinNo'].forEach((field) => {
      const control = this.jobCardForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    this.jobCardForm.patchValue({
      entryMode: 'existing',
      vehicleRegNo:
        status === 'registered' ? searchValue : this.vehicleAndCustomerDTO?.vehicleRegNo || 'N/A',
      vehicleVinNo:
        status === 'unregistered' ? searchValue : this.vehicleAndCustomerDTO?.vehicleVinNo || 'N/A',
      make: this.vehicleAndCustomerDTO?.vehicleMake || '',
      model: this.vehicleAndCustomerDTO?.vehicleModel || '',
      year: this.vehicleAndCustomerDTO?.vehicleYear || '',
      colour: this.vehicleAndCustomerDTO?.colour || '',
      otherSpecs: this.vehicleAndCustomerDTO?.otherSpecs || '',
      contactNumber: this.vehicleAndCustomerDTO?.contactNumbers || '',
      customerName: this.vehicleAndCustomerDTO?.customerName || '',
      email: this.vehicleAndCustomerDTO?.email || '',
      drivingLicenseNumber: this.vehicleAndCustomerDTO?.drivingLicenseNumber || '',
    });
    this.cdr.detectChanges();
  }

  private handleVehicleLookupError(searchValue: string, status: string): void {
    this.isExistingVehicle = false;

    // Dynamically apply required validators for manual entry since records were not found
    this.jobCardForm.get('vehicleRegNo')?.setValidators([Validators.required]);
    this.jobCardForm.get('vehicleVinNo')?.setValidators([Validators.required]);
    this.jobCardForm.get('make')?.setValidators([Validators.required]);
    this.jobCardForm.get('model')?.setValidators([Validators.required]);
    this.jobCardForm
      .get('year')
      ?.setValidators([Validators.required, Validators.pattern('^[0-9]{4}$')]);

    ['vehicleRegNo', 'vehicleVinNo', 'make', 'model', 'year'].forEach((field) => {
      this.jobCardForm.get(field)?.updateValueAndValidity();
    });

    this.jobCardForm.patchValue({
      entryMode: 'new',
      vehicleRegNo: status === 'registered' ? searchValue : 'N/A',
      vehicleVinNo: status === 'unregistered' ? searchValue : 'N/A',
      make: '',
      model: '',
      year: '',
      colour: '',
      otherSpecs: '',
      contactNumber: '',
      customerName: '',
      email: '',
      drivingLicenseNumber: '',
    });

    setTimeout(() => {
      console.warn('No Vehicle or Customer records found.');
      this.cdr.detectChanges();
    }, 0);
  }
}

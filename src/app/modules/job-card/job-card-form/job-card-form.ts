import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { VehicleAndCustomerResponseDTO } from '../../../dto/response/VehicleAndCustomerResponseDTO';
import { CustomerResponseProjection } from '../../../dto/response/CustomerResponseProjection';
import { TechnicianNameResponseProjection } from '../../../dto/response/TechnicianNameResponseProjection';
import { LaborActivityNameResponseProjection } from '../../../dto/response/LaborActivityNameResponseProjection';
import { VehicleMakeResponseDTO } from '../../../dto/response/VehicleMakeResponseDTO';
import { VehicleModelResponseDTO } from '../../../dto/response/VehicleModelResponseDTO';

import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import { SearchDropdown } from '../../../shared/components/search-dropdown/search-dropdown';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-job-card-form',
  templateUrl: './job-card-form.html',
  styleUrls: ['./job-card-form.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MultiSelectDropdown, SearchDropdown, Dropdown],
})
export class JobCardForm implements OnInit {

  vehicleColourList: string[] = ['Black', 'White', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Purple', 'Maroon', 'Other'];

  jobCardForm!: FormGroup;

  customer?: CustomerResponseProjection;
  vehicleAndCustomerDTO?: VehicleAndCustomerResponseDTO;

  makeList: VehicleMakeResponseDTO[] = [];
  modelList: VehicleModelResponseDTO[] = [];
  yearList: number[] = [];

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

  technicianNameProjection: TechnicianNameResponseProjection[] = [];
  laborActivityNameProjection: LaborActivityNameResponseProjection[] = [];

  constructor(private readonly fb: FormBuilder, private readonly adminService: AdminService, private readonly notificationService: NotificationService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}

  ngOnInit(): void {
    this.isExistingVehicle = false;
    this.initForm();
    this.generateVehicleYearOptions();
    this.setupFormListeners();
    this.loadItemNames();
    this.loadTechnicianNames();
    this.loadVehicleMakeList();
  }

  generateVehicleYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.yearList = Array.from({ length: currentYear - 1980 + 1 }, (_, index) => currentYear - index);
  }

  get isUnregistered(): boolean {
    return this.jobCardForm.get('vehicleRegStatus')?.value === 'unregistered';
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return this.jobCardForm?.get('laborActivitiesSelected') as FormControl;
  }

  get assignedTechniciansSelectedControl(): FormControl {
    return this.jobCardForm?.get('assignedTechniciansSelected') as FormControl;
  }

  initForm(): void {
    this.jobCardForm = this.fb.group({
      vehicleRegStatus: ['registered'],
      vehicleSearch: ['', Validators.required],
      unRegVehicleSearch: [''],
      customerSearch: [''],
      entryMode: ['new'],

      vehicleRegNo: ['N/A', Validators.required],
      vehicleVinNo: ['N/A', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      colour: [''],
      otherSpecs: [''],

      customerName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      drivingLicenseNumber: [''],
      complaint: ['', Validators.required],

      laborActivitiesSelected: [[], Validators.required],
      assignedTechniciansSelected: [[], Validators.required],
      currentMileage: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });
  }

  loadTechnicianNames(): void {
    this.adminService.getTechnicianNames().subscribe({
      next: (res: TechnicianNameResponseProjection[]) => {
        this.technicianNameProjection = res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error(err),
    });
  }

  loadItemNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: LaborActivityNameResponseProjection[]) => {
        this.laborActivityNameProjection = res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load labor activities', err),
    });
  }

  loadVehicleMakeList(): void {
    this.adminService.getVehicleMakeList().subscribe({
      next: (res: any) => {
        this.makeList = res?.data || [];

        if (this.makeList.length === 0) {
          this.notificationService.show('No vehicle makes found.', 'error');
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle makes:', err);

        const serverErrorMessage = err.error?.response || 'Please try again later. If not, please contact System Administrator.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');

        this.cdr.markForCheck();
      },
    });
  }

  loadVehicleModelsByMakeId(makeId: number): void {
    this.adminService.getVehicleModelListByMakeId(makeId).subscribe({
      next: (res: any) => {
        this.modelList = res?.data || [];

        if (this.modelList.length === 0) {
          this.notificationService.show('No vehicle models found for the selected make.', 'error');
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle models:', err);

        this.modelList = [];

        const serverErrorMessage = err.error?.response || 'Please try again later. If not, please contact System Administrator.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');

        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (!this.hasSearchedVehicle) {
      this.notificationService.show('Please search and verify the vehicle number before submitting the job card.', 'warning');
      return;
    }

    const vehicleFields = ['vehicleRegNo', 'vehicleVinNo', 'make', 'model', 'year'];
    const isVehicleInvalid = vehicleFields.some(field => this.jobCardForm.get(field)?.invalid);

    if (isVehicleInvalid) {
      vehicleFields.forEach(field => this.jobCardForm.get(field)?.markAsTouched());
      this.notificationService.show('Please fill out all required vehicle specification fields.', 'warning');
      return;
    }

    if (!this.isExistingVehicle && !this.hasSearchedCustomer) {
      this.notificationService.show('Please search and verify the customer contact number before submitting the job card.', 'warning');
      return;
    }

    const customerAndJobCardFields = ['customerName', 'email', 'contactNumber', 'complaint', 'laborActivitiesSelected', 'currentMileage', 'assignedTechniciansSelected'];
    const isCustomerAndJobCardInvalid = customerAndJobCardFields.some(field => this.jobCardForm.get(field)?.invalid);

    if (isCustomerAndJobCardInvalid) {
      customerAndJobCardFields.forEach(field => this.jobCardForm.get(field)?.markAsTouched());
      this.notificationService.show('Please fill out all required specification fields.', 'warning');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.jobCardForm.value;

    const vehicleMake = this.makeList.find(x => x.makeId === Number(formValue.make));
    const vehicleModel = this.modelList.find(x => x.id === Number(formValue.model));

    if (!vehicleMake) {
      this.notificationService.show('Please select a valid vehicle make.', 'warning');
      this.isSubmitting = false;
      return;
    }

    if (!vehicleModel) {
      this.notificationService.show('Please select a valid vehicle model.', 'warning');
      this.isSubmitting = false;
      return;
    }

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
        vehicleMake: vehicleMake.name,
        vehicleModel: vehicleModel.name,
        vehicleYear: formValue.year,
        colour: formValue.colour,
        otherSpecs: formValue.otherSpecs,
      },

      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
      assignedTechniciansSelected: formValue.assignedTechniciansSelected || [],
    };

    this.adminService.saveJobCardBlobVariant(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.notificationService.show('Job Card saved successfully!', 'success');

        if (res?.data) {
          this.notificationService.show('Invoice generated and posted successfully!', 'success');

          const base64String = res.data.replace(/\s/g, '');
          const binaryString = window.atob(base64String);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);

          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: 'application/pdf' });
          const pdfUrl = window.URL.createObjectURL(blob);

          window.open(pdfUrl, '_blank');

          this.router.navigate(['/dashboard/job-cards']);
        } else {
          this.notificationService.show('Failed to parse job card data or missing PDF data.', 'error');
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Submission crash details:', err);

        const serverErrorMessage = err.error?.response || 'Database constraint violation encountered.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');

        this.cdr.markForCheck();
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/job-cards']);
  }

  onCustomerSearchClick(): void {
    if (this.isSearchingCustomer) return;

    this.customerNotFound = false;
    this.customerFound = false;

    ['customerName', 'email', 'drivingLicenseNumber'].forEach(field => this.jobCardForm.get(field)?.reset());

    const value = this.jobCardForm.get('customerSearch')?.value?.trim();

    if (!value) {
      this.notificationService.show('Please type a customer contact number first.', 'warning');
      return;
    }

    this.hasSearchedCustomer = true;
    this.isSearchingCustomer = true;

    this.adminService.getCustomerByContactNumber(value).pipe(
      finalize(() => {
        this.isSearchingCustomer = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.customerFound = true;
        this.customer = res.data;
        this.isExistingCustomer = true;

        this.jobCardForm.patchValue({
          contactNumber: this.customer?.contactNumber || value,
          customerName: this.customer?.customerName || '',
          email: this.customer?.email || '',
          drivingLicenseNumber: this.customer?.drivingLicenseNumber || '',
        });
      },
      error: () => {
        this.customerNotFound = true;
        this.isExistingCustomer = false;

        this.jobCardForm.patchValue({ contactNumber: value });
      },
    });
  }

  onVehicleSearchClick(): void {
    if (this.isSearchingRegVehicle) return;

    this.vehicleFound = false;
    this.vehicleNotFound = false;

    const currentSearchValue = this.jobCardForm.get('vehicleSearch')?.value?.trim();

    if (!currentSearchValue) {
      this.notificationService.show('Please enter a vehicle registration number first.', 'warning');
      return;
    }

    this.hasSearchedVehicle = true;
    this.isSearchingRegVehicle = true;

    this.adminService.getVehicleAndCustomerByVehicleRegNumber(currentSearchValue).pipe(
      finalize(() => {
        this.isSearchingRegVehicle = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.vehicleFound = true;
        this.hasSearchedCustomer = true;
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
    if (this.isSearchingUnRegVehicle) return;

    this.vehicleFound = false;
    this.vehicleNotFound = false;

    const currentSearchValue = this.jobCardForm.get('unRegVehicleSearch')?.value?.trim();

    if (!currentSearchValue) {
      this.notificationService.show('Please enter a vehicle VIN number first.', 'warning');
      return;
    }

    this.hasSearchedVehicle = true;
    this.isSearchingUnRegVehicle = true;

    this.adminService.getVehicleAndCustomerByVehicleVinNumber(currentSearchValue).pipe(
      finalize(() => {
        this.isSearchingUnRegVehicle = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.vehicleFound = true;
        this.hasSearchedCustomer = true;
        this.handleVehicleLookupSuccess(res, currentSearchValue, 'unregistered');
      },
      error: (err) => {
        this.vehicleNotFound = true;
        console.error(err);
        this.handleVehicleLookupError(currentSearchValue, 'unregistered');
      },
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.jobCardForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private setupFormListeners(): void {
    this.jobCardForm.get('vehicleRegStatus')?.valueChanges.subscribe(status => {
      this.hasSearchedVehicle = false;

      const currentRegSearch = this.jobCardForm.get('vehicleSearch')?.value?.trim();
      const currentUnRegSearch = this.jobCardForm.get('unRegVehicleSearch')?.value?.trim();

      if (status === 'registered') {
        this.jobCardForm.patchValue({
          unRegVehicleSearch: '',
          vehicleRegNo: currentRegSearch || 'N/A',
          vehicleVinNo: 'N/A',
          entryMode: 'new',
        }, { emitEvent: false });
      } else {
        this.jobCardForm.patchValue({
          vehicleSearch: '',
          vehicleRegNo: 'N/A',
          vehicleVinNo: currentUnRegSearch || 'N/A',
          entryMode: 'new',
        }, { emitEvent: false });
      }

      this.isExistingVehicle = false;
      this.isExistingCustomer = false;
    });

    this.jobCardForm.get('make')?.valueChanges.subscribe(makeId => {
      this.modelList = [];
      this.jobCardForm.get('model')?.reset(null, { emitEvent: false });

      if (makeId) {
        this.loadVehicleModelsByMakeId(Number(makeId));
      }
    });
  }

  private handleVehicleLookupSuccess(res: any, searchValue: string, status: string): void {
    this.vehicleAndCustomerDTO = res.data;
    this.isExistingVehicle = true;
    this.isExistingCustomer = true;

    ['make', 'model', 'year', 'vehicleRegNo', 'vehicleVinNo'].forEach(field => {
      const control = this.jobCardForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    const vehicleMakeName = this.vehicleAndCustomerDTO?.vehicleMake || '';
    const vehicleModelName = this.vehicleAndCustomerDTO?.vehicleModel || '';

    const selectedMake = this.makeList.find(make => make.name?.toLowerCase() === vehicleMakeName.toLowerCase());

    this.jobCardForm.patchValue({
      entryMode: 'existing',
      vehicleRegNo: status === 'registered' ? searchValue : this.vehicleAndCustomerDTO?.vehicleRegNo || 'N/A',
      vehicleVinNo: status === 'unregistered' ? searchValue : this.vehicleAndCustomerDTO?.vehicleVinNo || 'N/A',
      make: selectedMake?.makeId || null,
      year: this.vehicleAndCustomerDTO?.vehicleYear || '',
      colour: this.vehicleAndCustomerDTO?.colour || '',
      otherSpecs: this.vehicleAndCustomerDTO?.otherSpecs || '',
      contactNumber: this.vehicleAndCustomerDTO?.contactNumbers || '',
      customerName: this.vehicleAndCustomerDTO?.customerName || '',
      email: this.vehicleAndCustomerDTO?.email || '',
      drivingLicenseNumber: this.vehicleAndCustomerDTO?.drivingLicenseNumber || '',
    }, { emitEvent: false });

    if (selectedMake) {
      this.adminService.getVehicleModelListByMakeId(selectedMake.makeId).subscribe({
        next: (modelRes: any) => {
          this.modelList = modelRes?.data || [];

          const selectedModel = this.modelList.find(model => model.name?.toLowerCase() === vehicleModelName.toLowerCase());

          this.jobCardForm.patchValue({
            model: selectedModel?.id || null,
          }, { emitEvent: false });

          this.cdr.detectChanges();
        },
        error: () => {
          this.modelList = [];
          this.cdr.detectChanges();
        },
      });
    }

    this.cdr.detectChanges();
  }

  private handleVehicleLookupError(searchValue: string, status: string): void {
    this.isExistingVehicle = false;
    this.isExistingCustomer = false;

    this.jobCardForm.get('vehicleRegNo')?.setValidators([Validators.required]);
    this.jobCardForm.get('vehicleVinNo')?.setValidators([Validators.required]);
    this.jobCardForm.get('make')?.setValidators([Validators.required]);
    this.jobCardForm.get('model')?.setValidators([Validators.required]);
    this.jobCardForm.get('year')?.setValidators([Validators.required, Validators.pattern('^[0-9]{4}$')]);

    ['vehicleRegNo', 'vehicleVinNo', 'make', 'model', 'year'].forEach(field => this.jobCardForm.get(field)?.updateValueAndValidity());

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

    this.cdr.detectChanges();
  }
}

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {Customer} from '../../../dto/response/customer/Customer';
import {VehicleAndCustomerDTO} from '../../../dto/response/VehicleAndCustomerDTO';
import {CommonModule} from '@angular/common';
import {MatOptionModule} from '@angular/material/core';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {TechnicianNameProjection} from '../../../dto/response/TechnicianNameProjection';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {NotificationService} from '../../../services/notificationService';
import {CustomerProjection} from '../../../dto/response/CustomerProjection';

@Component({
  selector: 'app-job-card-form',
  templateUrl: './job-card-form.html',
  styleUrls: ['./job-card-form.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatOptionModule, MultiSelectDropdown]
})
export class JobCardForm implements OnInit {

  @Output() cancel = new EventEmitter<void>();
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  jobCardForm!: FormGroup;

  customer: CustomerProjection | undefined;
  vehicleAndCustomerDTO: VehicleAndCustomerDTO | undefined;

  isDropdownOpen = false;
  isExistingVehicle = true;
  isExistingCustomer = true;

  technicianNameProjection: TechnicianNameProjection[] = [];
  laborActivityNameProjection: LaborActivityNameProjection[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.isExistingVehicle = true;
    this.initForm();
    this.loadItemNames();
    this.loadTechnicianNames();
  }

  loadTechnicianNames(): void {
    this.adminService.getTechnicianNames().subscribe({
      next: (res: TechnicianNameProjection[]) => {
        this.technicianNameProjection = res;
      },
      error: (err: any) => console.error(err)
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

  initForm(): void {
    this.jobCardForm = this.fb.group({
      vehicleSearch: [''],
      customerSearch: [''],
      entryMode: ['new'],

      // Adding core validations
      vehicleRegNo: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
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
    // 1. Trigger validations across ALL controls (including the common dropdown components)
    if (this.jobCardForm.invalid) {
      this.jobCardForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields before submitting.', 'error');
      return; // Block submission execution completely
    }

    const formValue = this.jobCardForm.value;

    // 2. Safely construct the exact payload contract structure expected by the backend
    const backendPayload = {
      dateAdded: new Date().toISOString(),
      estimatedCompletionTime: null,
      status: 'PENDING',
      customerComplaintText: formValue.complaint,
      existVehicle: formValue.entryMode === 'existing',
      customerDTO: {
        customerName: formValue.customerName,
        email: formValue.email,
        drivingLicenseNumber: formValue.drivingLicenseNumber,
        contactNumbers: formValue.contactNumber
      },
      vehicleSaveRequestDTO: {
        vehicleRegNo: formValue.vehicleRegNo,
        vehicleMake: formValue.make,
        vehicleModel: formValue.model,
        vehicleYear: formValue.year,
        colour: formValue.colour,
        otherSpecs: formValue.otherSpecs
      },
      // Safe arrays extraction mapping precisely to your reactive form keys
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
      assignedTechniciansSelected: formValue.assignedTechniciansSelected || []
    };

    // 3. Dispatch the payload request
    this.adminService.saveJobCardBlobVariant(backendPayload).subscribe({
      next: (res: any) => {
        this.notificationService.show('Job Card saved successfully!', 'success');

        if (res && res.data) {
          try {
            // Clean up any potential whitespace/newlines from the base64 string
            const base64Data = res.data.replace(/\s/g, '');

            // Decode the Base64 string into a raw binary string
            const byteCharacters = atob(base64Data);

            // Allocate an ArrayBuffer matching the exact character length
            const byteNumbers = new Uint8Array(byteCharacters.length);

            // Populate the typed array with actual numeric character codes
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            // Create the Blob explicitly binding the 'application/pdf' MIME type
            const pdfBlob = new Blob([byteNumbers], { type: 'application/pdf' });

            // Generate the unique internal blob URL
            const fileURL = window.URL.createObjectURL(pdfBlob);

            // Open a clean view tab
            const pdfWindow = window.open();
            if (pdfWindow) {
              pdfWindow.location.href = fileURL;
            } else {
              this.notificationService.show('Popup blocked! Please allow popups for this site.', 'error');
            }

            // Give the browser ample time to load the tab before destroying the reference object
            setTimeout(() => window.URL.revokeObjectURL(fileURL), 5000);

          } catch (encodeError) {
            console.error('Base64 parsing failed:', encodeError);
            this.notificationService.show('Failed to render PDF layout data.', 'error');
          }
        }

        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error saving Job Card:', err);
        this.notificationService.show('Failed to save Job Card. Please verify details.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onCustomerSearchClick(): void {
    const customerFields = ['customerName', 'email', 'contactNumber', 'drivingLicenseNumber'];
    customerFields.forEach(field => this.jobCardForm.get(field)?.reset());
    const value = this.jobCardForm.get('customerSearch')?.value;
    this.adminService.getCustomerByContactNumber(value).subscribe({
      next: (res: any) => {
        this.customer = res.data;
        this.isExistingCustomer=true
        this.jobCardForm.patchValue({
          contactNumber: this.customer?.contactNumber,
          customerName: this.customer?.customerName,
          email: this.customer?.email,
          drivingLicenseNumber: this.customer?.drivingLicenseNumber
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        setTimeout(() => {
          console.log(err);
          this.isExistingCustomer=false
          this.notificationService.show('No Customer found with that driving license.', 'error');
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  onVehicleSearchClick(): void {
    const currentSearchValue = this.jobCardForm.get('vehicleSearch')?.value;
    this.jobCardForm.reset({vehicleSearch: currentSearchValue});
    const value = this.jobCardForm.get('vehicleSearch')?.value;

    this.adminService.getVehicleAndCustomerByVehicleRegNumber(value).subscribe({
      next: (res: any) => {
        this.vehicleAndCustomerDTO = res;

        // Mark as existing vehicle since we found a record
        this.isExistingVehicle = true;

        this.jobCardForm.patchValue({
          entryMode: 'existing', // Syncing form state with the search result
          vehicleRegNo: this.vehicleAndCustomerDTO?.vehicleRegNo,
          make: this.vehicleAndCustomerDTO?.vehicleMake,
          model: this.vehicleAndCustomerDTO?.vehicleModel,
          year: this.vehicleAndCustomerDTO?.vehicleYear,
          colour: this.vehicleAndCustomerDTO?.colour,
          otherSpecs: this.vehicleAndCustomerDTO?.otherSpecs,
          contactNumber: this.vehicleAndCustomerDTO?.contactNumbers,
          customerName: this.vehicleAndCustomerDTO?.customerName,
          email: this.vehicleAndCustomerDTO?.email,
          drivingLicenseNumber: this.vehicleAndCustomerDTO?.drivingLicenseNumber
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);

        // 1. Reset the form states instantly
        const currentSearchValue = this.jobCardForm.get('vehicleSearch')?.value;
        this.jobCardForm.reset({
          vehicleSearch: currentSearchValue,
          vehicleRegNo: currentSearchValue,
          entryMode: 'new'
        });
        this.isExistingVehicle = false;

        // 2. Defer the notification and explicitly force Angular to draw it
        setTimeout(() => {
          this.notificationService.show('No Vehicle or Customer records found.', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
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
    return (this.jobCardForm?.get('assignedTechniciansSelected') as FormControl) || new FormControl([]);
  }

  isInvalid(controlName: string): boolean {
    const control = this.jobCardForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

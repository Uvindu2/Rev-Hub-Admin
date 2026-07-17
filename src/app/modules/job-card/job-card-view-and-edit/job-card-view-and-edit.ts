import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output, SimpleChanges,
  ViewChild, OnChanges
} from '@angular/core';
import {MultiSelectDropdown} from "../../../shared/components/multi-select-dropdown/multi-select-dropdown";
import {NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Customer} from '../../../dto/response/customer/Customer';
import {VehicleAndCustomerDTO} from '../../../dto/response/VehicleAndCustomerDTO';
import {TechnicianNameProjection} from '../../../dto/response/TechnicianNameProjection';
import {LaborActivityNameProjection} from '../../../dto/response/LaborActivityNameProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';

@Component({
  selector: 'app-job-card-view-and-edit',
  imports: [
    MultiSelectDropdown,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './job-card-view-and-edit.html',
  styleUrl: './job-card-view-and-edit.css',
})
export class JobCardViewAndEdit implements OnInit, AfterViewInit {

  @Input() jobCardData: JobCardProjection | undefined;
  @Input() isViewModalOpen: boolean = true;
  @Input() isEditModalOpen: boolean = false;
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  jobCardForm!: FormGroup;

  customer: Customer | undefined;

  isDropdownOpen = false;

  technicianNameProjection: TechnicianNameProjection[] = [];
  laborActivityNameProjection: LaborActivityNameProjection[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadMetadataAndPatch();
  }

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.jobCardData) {
      this.patchFormWithData(this.jobCardData);
    }
  }

  private patchFormWithData(data: JobCardProjection): void {
    // Use patchValue with a complete object map
    this.jobCardForm.patchValue({
      vehicleRegNo: data.vehicle?.vehicleRegNo,
      make: data.vehicle?.vehicleMake,
      model: data.vehicle?.vehicleModel,
      year: data.vehicle?.vehicleYear,
      colour: data.vehicle?.colour,
      otherSpecs: data.vehicle?.otherSpecs,
      customerName: data.vehicle?.customer?.customerName,
      contactNumber: data.vehicle?.customer?.contactNumber,
      email: data.vehicle?.customer?.email,
      drivingLicenseNumber: data.vehicle?.customer?.drivingLicenseNumber,
      complaint: data.customerComplaintText,
      laborActivitiesSelected: data.laborActivities?.map(a => a.laborActivityId) || [],
      assignedTechniciansSelected: data.technician?.map(t => t.technicianId) || []
    }, {emitEvent: false}); // <--- Crucial: Prevents recursive form loops

    this.cdr.markForCheck();
  }

  initForm(): void {
    this.jobCardForm = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      colour: [''],
      otherSpecs: [''],
      customerName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      drivingLicenseNumber: ['', Validators.required],
      complaint: ['', Validators.required],
      laborActivitiesSelected: [[], Validators.required],
      assignedTechniciansSelected: [[], Validators.required],
      currentMileage: ['', Validators.required],
    });
    // Immediately set the state based on the current mode
    if (!this.isEditModalOpen) {
      this.jobCardForm.disable();
    } else {
      // 1. Disable the whole form
      this.jobCardForm.disable();

      // 2. Explicitly enable only the vehicleRegNo
      this.jobCardForm.get('laborActivitiesSelected')?.enable();
      this.jobCardForm.get('assignedTechniciansSelected')?.enable();
      this.jobCardForm.get('currentMileage')?.enable();
      this.jobCardForm.get('complaint')?.enable();
    }
  }

  loadMetadataAndPatch(): void {
    // Use forkJoin to wait for both metadata requests to finish
    import('rxjs').then(({forkJoin}) => {
      forkJoin({
        techs: this.adminService.getTechnicianNames(),
        labor: this.adminService.getLaborActivityNames()
      }).subscribe(({techs, labor}) => {
        this.technicianNameProjection = techs;
        this.laborActivityNameProjection = labor;

        // NOW we have the options, we can safely patch
        if (this.jobCardData) {
          this.patchFormWithData(this.jobCardData);
        }
        this.cdr.markForCheck();
      });
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
      jobId: this.jobCardData?.jobId,
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
      assignedTechniciansSelected: formValue.assignedTechniciansSelected || [],
      customerComplaintText: formValue.complaint || null
    };
    // 3. Dispatch the payload request
    this.adminService.modifyJobCardBlobVariant(backendPayload).subscribe({
      next: (res: any) => {
        this.notificationService.show('Job Card modified successfully!', 'success');

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
            const pdfBlob = new Blob([byteNumbers], {type: 'application/pdf'});

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
        this.notificationService.show('Failed to modified Job Card. Please verify details.', 'error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
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

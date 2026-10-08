import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import { Customer } from '../../../dto/response/customer/Customer';
import { TechnicianNameResponseProjection } from '../../../dto/response/TechnicianNameResponseProjection';
import { LaborActivityNameResponseProjection } from '../../../dto/response/LaborActivityNameResponseProjection';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { JobCardResponseDto } from '../../../dto/response/JobCardResponseDto';
import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import { PdfPreviewResponse } from '../../../dto/response/PdfPreviewResponse';

@Component({
  selector: 'app-job-card-view-and-edit',
  imports: [NgIf, ReactiveFormsModule, MultiSelectDropdown],
  templateUrl: './job-card-view-and-edit.html',
  styleUrl: './job-card-view-and-edit.css',
  standalone: true
})
export class JobCardViewAndEdit implements OnInit {

  jobCardForm!: FormGroup;
  jobCard: JobCardResponseDto | undefined;
  jobCardId!: number;

  customer: Customer | undefined;

  isEditMode = false;
  isSubmitting = false;

  technicianNameProjection: TechnicianNameResponseProjection[] = [];
  laborActivityNameProjection: LaborActivityNameResponseProjection[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.router.url.includes('/job-cards/edit/');

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/dashboard/job-cards']);
      return;
    }

    this.jobCardId = Number(id);

    this.initForm();
    this.loadJobCard();
  }

  private initForm(): void {
    this.jobCardForm = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleVinNo: ['', Validators.required],
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
      currentMileage: ['', Validators.required]
    });

    if (!this.isEditMode) {
      this.jobCardForm.disable();
    }
  }

  private loadJobCard(): void {
    forkJoin({
      techs: this.adminService.getTechnicianNames(),
      labor: this.adminService.getLaborActivityNames(),
      jobCard: this.adminService.getJobCardById(this.jobCardId)
    }).subscribe({
      next: ({ techs, labor, jobCard }: any) => {
        this.technicianNameProjection = techs?.data || techs || [];
        this.laborActivityNameProjection = labor?.data || labor || [];
        this.jobCard = jobCard?.data || jobCard;

        if (!this.jobCard) {
          this.notificationService.show('Job Card not found.', 'error');
          this.router.navigate(['/dashboard/job-cards']);
          return;
        }

        this.patchFormWithData(this.jobCard);

        if (this.isEditMode) {
          this.jobCardForm.enable();

          this.jobCardForm.get('vehicleRegNo')?.disable();
          this.jobCardForm.get('vehicleVinNo')?.disable();
          this.jobCardForm.get('make')?.disable();
          this.jobCardForm.get('model')?.disable();
          this.jobCardForm.get('year')?.disable();
          this.jobCardForm.get('colour')?.disable();
          this.jobCardForm.get('otherSpecs')?.disable();
          this.jobCardForm.get('customerName')?.disable();
          this.jobCardForm.get('contactNumber')?.disable();
          this.jobCardForm.get('email')?.disable();
          this.jobCardForm.get('drivingLicenseNumber')?.disable();
        } else {
          this.jobCardForm.disable();
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load job card:', err);
        this.notificationService.show('Failed to load job card details.', 'error');
        this.router.navigate(['/dashboard/job-cards']);
      }
    });
  }

  private patchFormWithData(data: JobCardResponseDto): void {
    this.jobCardForm.patchValue({
      vehicleRegNo: data.vehicle?.vehicleRegNo,
      vehicleVinNo: data.vehicle?.vehicleVinNo,
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
      currentMileage: data.currentMileage,
      laborActivitiesSelected: data.laborActivities?.map(a => a.laborActivityId) || [],
      assignedTechniciansSelected: data.technicians?.map(t => t.technicianId) || []
    }, { emitEvent: false });

    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isEditMode) {
      return;
    }

    if (this.jobCardForm.invalid) {
      this.jobCardForm.markAllAsTouched();
      this.notificationService.show(
        'Please fill out all required fields before submitting.',
        'error'
      );
      return;
    }

    this.isSubmitting = true;

    const formValue = this.jobCardForm.getRawValue();

    const backendPayload = {
      jobId: this.jobCardId,
      laborActivitiesSelected: formValue.laborActivitiesSelected || [],
      assignedTechniciansSelected: formValue.assignedTechniciansSelected || [],
      customerComplaintText: formValue.complaint || null
    };

    this.adminService.modifyJobCardBlobVariant(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        console.log('Modify Job Card response:', res);

        try {
          const pdfResponse: PdfPreviewResponse = res?.data || res;

          if (!pdfResponse?.id) {
            this.notificationService.show(
              'Job Card was modified, but the Job Card ID was not returned.',
              'error'
            );
            return;
          }

          this.notificationService.show(
            'Job Card modified successfully!',
            'success'
          );

          this.router.navigate(['/dashboard/pdf-preview', 'job-card', pdfResponse.id]);

        } catch (error) {
          console.error('Failed to navigate to PDF preview:', error);

          this.notificationService.show(
            'Job Card was modified, but PDF preview could not be opened.',
            'error'
          );
        }
      },
      error: (err: any) => {
        console.error('Error saving Job Card:', err);

        this.notificationService.show(
          'Failed to modify Job Card. Please verify details.',
          'error'
        );

        this.cdr.markForCheck();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/job-cards']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.jobCardForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get repairLaborActivitiesSelectedControl(): FormControl {
    return (this.jobCardForm?.get('laborActivitiesSelected') as FormControl) || new FormControl([]);
  }

  get assignedTechniciansSelectedControl(): FormControl {
    return (this.jobCardForm?.get('assignedTechniciansSelected') as FormControl) || new FormControl([]);
  }
}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {JobCardTableViewResponseDTO} from '../../../dto/response/JobCardTableViewResponseDTO';
import {TechnicianNameResponseProjection} from '../../../dto/response/TechnicianNameResponseProjection';
import {SearchDropdown} from '../../../shared/components/search-dropdown/search-dropdown';

@Component({
  selector: 'app-job-card-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    SearchDropdown
  ],
  templateUrl: './job-card-view.html',
  styleUrl: './job-card-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardView implements OnInit {

  jobCards: JobCardTableViewResponseDTO[] = [];
  filterForm!: FormGroup;

  availableVehicles: string[] = [];
  availableVehicleVins: string[] = [];

  currentPage = 1;
  pageSize = 5;
  totalElements = 0;
  totalPagesCount = 0;
  pageSizes = [5, 10, 20, 50];

  isLoading = false;

  technicianNameProjection: TechnicianNameResponseProjection[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchVehicleRegNos();
    this.fetchVehicleVinNos();
    this.loadTechnicianNames();
    this.fetchJobCards();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      vehicleRegNo: [''],
      vehicleVinNo: [''],
      technicianId: [''],
      status: [''],
      dateFrom: [''],
      dateTo: [''],
    });
  }

  fetchJobCards(): void {
    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.adminService.searchJobCards(
      formValues,
      backendPage,
      this.pageSize,
      'jobId',
      'desc'
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {
        const pageData = response?.data || response;

        let updatedJobCards: JobCardTableViewResponseDTO[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (pageData?.content !== undefined) {
          updatedJobCards = pageData.content || [];

          if (pageData.page) {
            updatedTotalElements = pageData.page.totalElements ?? pageData.page.total_elements ?? 0;
            updatedTotalPagesCount = pageData.page.totalPages ?? pageData.page.total_pages ?? 0;
          } else {
            updatedTotalElements = pageData.totalElements ?? pageData.total_elements ?? 0;
            updatedTotalPagesCount = pageData.totalPages ?? pageData.total_pages ?? 0;
          }
        } else if (Array.isArray(pageData)) {
          updatedJobCards = pageData;
          updatedTotalElements = pageData.length;
          updatedTotalPagesCount = Math.ceil(pageData.length / this.pageSize) || 1;
        }

        this.jobCards = updatedJobCards;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load job cards from server:', err);

        this.jobCards = [];
        this.totalElements = 0;
        this.totalPagesCount = 0;

        this.notificationService.show('Failed to load job cards.', 'error');
        this.cdr.markForCheck();
      },
    });
  }

  onApplyFilters(): void {
    this.currentPage = 1;
    this.fetchJobCards();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      search: '',
      vehicleRegNo: '',
      vehicleVinNo: '',
      technicianId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });

    this.currentPage = 1;
    this.fetchJobCards();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchJobCards();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchJobCards();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchJobCards();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchJobCards();
    }
  }

  onAddJobCard(): void {
    this.router.navigate(['/dashboard/job-cards/new']);
  }

  viewJob(jobCardId: number): void {
    this.router.navigate([
      '/dashboard/pdf-preview/job-card',
      jobCardId
    ]);
    // this.adminService.getJobCardPdfById(jobCardId).subscribe({
    //   next: (res: any) => {
    //     try {
    //       if (!res?.data) {
    //         this.notificationService.show('Error: Unable to load the PDF.', 'error');
    //         return;
    //       }
    //
    //       const base64String = res.data.replace(/\s/g, '');
    //       const binaryString = window.atob(base64String);
    //       const bytes = new Uint8Array(binaryString.length);
    //
    //       for (let i = 0; i < binaryString.length; i++) {
    //         bytes[i] = binaryString.charCodeAt(i);
    //       }
    //
    //       const blob = new Blob([bytes], {type: 'application/pdf'});
    //       const unsafeUrl = window.URL.createObjectURL(blob);
    //
    //       this.router.navigate(['/dashboard/job-cards/print'], {
    //         state: {
    //           pdfUrl: unsafeUrl,
    //           pdfName: 'Job Card Print Preview',
    //           returnUrl: '/dashboard/job-cards'
    //         }
    //       });
    //     } catch (error) {
    //       console.error('PDF decode error:', error);
    //       this.notificationService.show('Error: Unable to load the PDF.', 'error');
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Job Card PDF loading error:', err);
    //     this.notificationService.show('Failed to load Job Card PDF.', 'error');
    //   }
    // });
  }

  editJob(id: number): void {
    this.router.navigate(['/dashboard/job-cards/edit', id]);
  }

  private fetchVehicleRegNos(): void {
    this.adminService.getAllVehicleRegNos().subscribe({
      next: (response: any) => {
        const regNos = response?.data || response;
        this.availableVehicles = Array.isArray(regNos) ? regNos : [];
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle registration numbers:', err);
        this.availableVehicles = [];
        this.cdr.markForCheck();
      },
    });
  }

  private fetchVehicleVinNos(): void {
    this.adminService.getAllVehicleVinNos().subscribe({
      next: (response: any) => {
        const vinNos = response?.data || response;
        this.availableVehicleVins = Array.isArray(vinNos) ? vinNos : [];
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle VIN numbers:', err);
        this.availableVehicleVins = [];
        this.cdr.markForCheck();
      },
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
}

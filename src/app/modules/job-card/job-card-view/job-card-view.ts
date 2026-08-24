import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { JobCardViewAndEdit } from '../job-card-view-and-edit/job-card-view-and-edit';
import { NotificationService } from '../../../services/notificationService';
import { JobCardSummaryResponseDTO } from '../../../dto/response/JobCardSummaryResponseDTO';
import { TechnicianNameProjection } from '../../../dto/response/TechnicianNameProjection';
import { JobCardForm } from '../job-card-form/job-card-form';
import { finalize } from 'rxjs';
import { PrintPreview } from '../../invoice/print-preview/print-preview';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-job-card-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JobCardViewAndEdit,
    FormsModule,
    JobCardForm,
    PrintPreview,
  ],
  templateUrl: './job-card-view.html',
  styleUrl: './job-card-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardView implements OnInit {
  jobCards: JobCardSummaryResponseDTO[] = [];
  jobCard: JobCardProjection | undefined;

  // BEST PRACTICE: Unified Reactive Form Group for filters
  filterForm!: FormGroup;

  availableVehicles: string[] = [];

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;
  technicianNameProjection: TechnicianNameProjection[] = [];

  showPrintModal: boolean = false;
  generatedPdfUrl: SafeResourceUrl | null = null;
  jobCardPdfUrl: SafeResourceUrl | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchVehicleRegNos();
    this.loadTechnicianNames();
    this.fetchJobCards();
  }

  // Initialize form controls matching your backend search request DTO
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      vehicle: [''],
      technicianId: [''],
      status: [''],
      dateFrom: [''],
      dateTo: [''],
    });
  }

  fetchJobCards(): void {
    const backendPage = this.currentPage - 1;

    // Extract values directly from the form group
    const formValues = this.filterForm.value;

    // Start loader
    this.isLoading = true;
    this.cdr.markForCheck();

    this.adminService
      .searchJobCards(formValues, backendPage, this.pageSize, 'jobId', 'desc')
      .pipe(
        finalize(() => {
          // Stop loader for both success and error
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);

          // Extract page data safely
          const pageData = response?.data || response;

          let updatedJobCards: JobCardSummaryResponseDTO[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (pageData?.content !== undefined) {
            updatedJobCards = pageData.content || [];

            // Handle custom page wrapper
            if (pageData.page) {
              updatedTotalElements =
                pageData.page.totalElements ?? pageData.page.total_elements ?? 0;

              updatedTotalPagesCount = pageData.page.totalPages ?? pageData.page.total_pages ?? 0;
            } else {
              // Standard Spring Page
              updatedTotalElements = pageData.totalElements ?? pageData.total_elements ?? 0;

              updatedTotalPagesCount = pageData.totalPages ?? pageData.total_pages ?? 0;
            }
          } else if (Array.isArray(pageData)) {
            updatedJobCards = pageData;

            updatedTotalElements = pageData.length;

            updatedTotalPagesCount = Math.ceil(pageData.length / this.pageSize) || 1;
          }

          // Apply data
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

          this.cdr.markForCheck();
        },
      });
  }

  onApplyFilters(): void {
    this.currentPage = 1; // Reset to page 1 on new filter execution
    this.fetchJobCards();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      search: '',
      vehicle: '',
      technician: '',
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
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.jobCard = undefined;
    this.cdr.markForCheck();
  }

  viewJob(id: number): void {
    this.adminService.getJobCardById(id).subscribe({
      next: (response: any) => {
        this.jobCard = response.data;
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.show('Failed to load job card details', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  editJob(id: number): void {
    this.adminService.getJobCardById(id).subscribe({
      next: (response: any) => {
        this.jobCard = response.data;
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.show('Failed to load job card details', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  deleteJob(id: number): void {
    console.log('Deleting ID:', id);
  }

  private fetchVehicleRegNos(): void {
    this.adminService.getAllVehicleRegNos().subscribe({
      next: (response: any) => {
        // Handle standard response wrapper (e.g., response.data or direct array)
        const regNos = response?.data || response;

        if (Array.isArray(regNos)) {
          this.availableVehicles = regNos;
        } else {
          this.availableVehicles = [];
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle registration numbers:', err);
        this.availableVehicles = [];
        this.cdr.markForCheck();
      },
    });
  }

  loadTechnicianNames(): void {
    this.adminService.getTechnicianNames().subscribe({
      next: (res: TechnicianNameProjection[]) => {
        this.technicianNameProjection = res;
      },
      error: (err: any) => console.error(err),
    });
  }

  handleJobCardGenerated(pdfUrl: SafeResourceUrl) {
    this.isEditModalOpen = false; // Close the job card form modal
    this.jobCardPdfUrl = pdfUrl; // Assign to jobCardPdfUrl for the print preview modal
    this.showPrintModal = true; // Open the print preview modal
    this.cdr.markForCheck();
  }

  // Triggered when the user clicks 'Close' inside the print preview modal
  closePrintPreview() {
    this.showPrintModal = false;
    this.jobCardPdfUrl = null;
  }
}

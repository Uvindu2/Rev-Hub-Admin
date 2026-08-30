import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'; // Fixed: Added OnInit import
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TechnicianProjectionWithJobStatus } from '../../../dto/response/TechnicianProjectionWithJobStatus';
import { TechnicianForm } from '../technician-form/technician-form';
import { TechnicianViewAndEdit } from '../technician-view-and-edit/technician-view-and-edit';
import { TechnicianProjection } from '../../../dto/response/TechnicianProjection';
import { finalize } from 'rxjs';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';
import {TechnicianNameProjection} from '../../../dto/response/TechnicianNameProjection'; // Fixed: Added CommonModule import

@Component({
  selector: 'app-technician-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TechnicianForm,
    TechnicianViewAndEdit,
    ReactiveFormsModule,
    Dropdown,
  ], // Fixed: Added CommonModule for table structural bindings (*ngFor, ngClass)
  templateUrl: './technician-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './technician-view.css',
})
export class TechnicianView implements OnInit {
  // Fixed: Added implements OnInit
  // Balanced 8-record technician dataset matching your system framework
  filterForm!: FormGroup;

  technicians: TechnicianProjectionWithJobStatus[] = [];
  technician: TechnicianProjection | undefined;
  technicianIdNameDtos:TechnicianNameProjection[]=[];

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef, // Injecting manual render utility
    private readonly notificationService: NotificationService,
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchTechnicianIdNames();
    this.fetchTechnicians();
  }

  fetchTechnicianIdNames(){
    this.adminService.getAllTechnicianIdNames().subscribe({
      next: (response: any) => {
        const TechnicianNameProjection = response?.data || response;
        if (Array.isArray(TechnicianNameProjection)) {
          this.technicianIdNameDtos = TechnicianNameProjection;
        } else {
          this.technicianIdNameDtos = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load user names:', err);
        this.technicianIdNameDtos = [];
        this.cdr.markForCheck();
      },
    });
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      technicianId: [''],
      jobStatus: [''],
    });
  }

  fetchTechnicians(): void {
    // Start loader
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    this.adminService
      .searchTechniciansPaginated(formValues,backendPage, this.pageSize, this.sortByField, this.sortDirection)
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
          // Stage updates in local variables first to prevent layout thrashing
          let updatedTechnicians: TechnicianProjectionWithJobStatus[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (response?.data?.content !== undefined) {
            updatedTechnicians = response.data.content || [];
            console.warn('Technician data:', updatedTechnicians);
            updatedTotalElements =
              response.data.page.totalElements === undefined
                ? response.data.total_elements || 0
                : response.data.page.totalElements;
            updatedTotalPagesCount =
              response.data.page.totalPages === undefined
                ? response.data.total_pages || 0
                : response.data.page.totalPages;
          } else if (Array.isArray(response)) {
            updatedTechnicians = response;
            updatedTotalElements = response.length;
            updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
          }

          // Apply properties all at once
          this.technicians = updatedTechnicians;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          // Notify Angular to redraw on the next frame paint seamlessly
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load technician from server:', err);
          this.technicians = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;
          this.cdr.markForCheck();
        },
      });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchTechnicians(); // fetchTechnicians will run cdr.markForCheck() when done
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchTechnicians();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchTechnicians();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchTechnicians();
    }
  }

  // Local action triggers require instant local checks
  onAddTechnicians(): void {
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.technician = undefined;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    console.log('Searching...');
  }

  viewTechnician(id: number): void {
    console.log('Viewing ID:', id);

    this.adminService.getTechnicianById(id).subscribe({
      next: (response: any) => {
        this.technician = response.data;
        console.log(response);
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load technician from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      },
    });
  }

  editTechnician(id: number): void {
    this.adminService.getTechnicianById(id).subscribe({
      next: (response: any) => {
        this.technician = response.data;
        console.log(response);
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load technician from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      },
    });
  }

  deleteTechnician(id: number): void {
    console.log('Deleting ID:', id);
  }

  protected onAddTechnician() {
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      technicianName: '',
    });
    this.currentPage = 1;
    this.fetchTechnicians();
  }

  onApplyFilters(): void {
    const formValues = this.filterForm.value;
    console.log('Applying filters:', formValues);
    this.currentPage = 1;
    this.fetchTechnicians();
  }
}

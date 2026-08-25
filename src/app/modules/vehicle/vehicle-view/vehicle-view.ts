import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleEditFormComponent } from '../vehicle-edit-form/vehicle-edit-form';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleSummaryProjection } from '../../../dto/response/VehicleSummaryProjection';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { VehicleProjection } from '../../../dto/response/VehicleProjection';
import { finalize } from 'rxjs';
import { Dropdown } from "../../../shared/components/dropdown/dropdown";

@Component({
  selector: 'app-vehicle-view',
  standalone: true,
  imports: [CommonModule, VehicleEditFormComponent, FormsModule, Dropdown, ReactiveFormsModule],
  templateUrl: './vehicle-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './vehicle-view.css',
})
export class VehicleView implements OnInit {
  allVehicles: VehicleSummaryProjection[] = [];

  filterForm!: FormGroup;
  
  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Filter Bindings
  searchTerm: string = '';
  availableVehicles: string[] = [];
  availableVehicleVins: string[] = [];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  // Modal State Control Properties
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;
  isSearch: boolean = false;
  selectedVehicle: VehicleProjection | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchVehicleRegNos();
    this.fetchVehicleVinNos();
    this.fetchVehicles();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      vehicleRegNo: [''],
      vehicleVinNo: [''],
    });
  }

  private fetchVehicleRegNos(): void {
    this.adminService.getAllVehicleRegNos().subscribe({
      next: (response: any) => {
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

  private fetchVehicleVinNos(): void {
    this.adminService.getAllVehicleVinNos().subscribe({
      next: (response: any) => {
        const vinNos = response?.data || response;
        if (Array.isArray(vinNos)) {
          this.availableVehicleVins = vinNos;
        } else {
          this.availableVehicleVins = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle VIN numbers:', err);
        this.availableVehicleVins = []; // Fixed: targets availableVehicleVins now
        this.cdr.markForCheck();
      },
    });
  }

  viewVehicle(id: number): void {
    this.adminService.getVehicleById(id).subscribe({
      next: (response: any) => {
        this.selectedVehicle = response.data;
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load vehicle from server:', 'error');
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  editVehicle(id: number): void {
    this.adminService.getVehicleById(id).subscribe({
      next: (response: any) => {
        this.selectedVehicle = response.data;
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load vehicle from server:', 'error');
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.isViewModalOpen = false;
    this.selectedVehicle = undefined;
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchVehicles();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchVehicles();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchVehicles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchVehicles();
    }
  }

  fetchVehicles() {
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;

    this.adminService.getVehiclesPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {
        let updatedVehicles: VehicleSummaryProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.content !== undefined) {
          updatedVehicles = response.content || [];
          updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
          updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
        } else if (Array.isArray(response)) {
          updatedVehicles = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
        }

        this.allVehicles = updatedVehicles;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load vehicles from server:', err);
        this.allVehicles = [];
        this.totalElements = 0;
        this.totalPagesCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  onApplyFilters(): void {
    const formValues = this.filterForm.value;
    console.log('Applying filters:', formValues);
    this.currentPage = 1;
    this.fetchVehicles();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      vehicleRegNo: '',
      vehicleVinNo: '',
    });
    this.searchTerm = '';
    this.currentPage = 1;
    this.fetchVehicles();
  }

  search() {
    if (this.isSearch) {
      return;
    }
    this.isSearch = true;
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { VehicleTableViewResponseProjection } from '../../../dto/response/VehicleTableViewResponseProjection';
import { AdminService } from '../../../services/admin.service';
import { SearchDropdown } from '../../../shared/components/search-dropdown/search-dropdown';

@Component({
  selector: 'app-vehicle-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchDropdown],
  templateUrl: './vehicle-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './vehicle-view.css',
})
export class VehicleView implements OnInit {

  allVehicles: VehicleTableViewResponseProjection[] = [];

  filterForm!: FormGroup;

  currentPage = 1;
  pageSize = 5;

  totalElements = 0;
  totalPagesCount = 0;

  pageSizes = [5, 10, 20, 50];

  searchTerm = '';

  availableVehicles: string[] = [];
  availableVehicleVins: string[] = [];

  sortByField = 'createdDate';
  sortDirection = 'desc';

  isLoading = false;
  isSearch = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
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
      vehicleVinNo: ['']
    });
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
      }
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
      }
    });
  }

  viewVehicle(id: number): void {
    this.router.navigate(['/dashboard/vehicles/view', id], {
      state: { mode: 'view' }
    });
  }

  editVehicle(id: number): void {
    this.router.navigate(['/dashboard/vehicles/edit', id], {
      state: { mode: 'edit' }
    });
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

  fetchVehicles(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    this.adminService.getVehiclesPaginated(
      formValues,
      backendPage,
      this.pageSize,
      this.sortByField,
      this.sortDirection
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {

        let updatedVehicles: VehicleTableViewResponseProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        const pageData = response?.data || response;

        if (pageData?.content !== undefined) {

          updatedVehicles = pageData.content || [];

          updatedTotalElements =
            pageData.page?.totalElements ??
            pageData.totalElements ??
            0;

          updatedTotalPagesCount =
            pageData.page?.totalPages ??
            pageData.totalPages ??
            0;

        } else if (Array.isArray(pageData)) {

          updatedVehicles = pageData;
          updatedTotalElements = pageData.length;
          updatedTotalPagesCount =
            Math.ceil(pageData.length / this.pageSize) || 1;
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
    console.log('Applying filters:', this.filterForm.value);

    this.currentPage = 1;
    this.fetchVehicles();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      vehicleRegNo: '',
      vehicleVinNo: ''
    });

    this.searchTerm = '';
    this.currentPage = 1;

    this.fetchVehicles();
  }

  search(): void {
    if (this.isSearch) return;

    this.isSearch = true;
  }
}

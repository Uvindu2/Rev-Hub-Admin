import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VehicleEditFormComponent} from '../vehicle-edit-form/vehicle-edit-form';
import {VehicleViewForm} from '../vehicle-view-form/vehicle-view-form';
import {FormsModule} from '@angular/forms';
import {VehicleSummaryProjection} from '../../../dto/response/VehicleSummaryProjection';
import {AdminService} from '../../../services/admin.service';

export interface Customer {
  licenseNumber?: string;
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
}

export interface Vehicle {
  regNo: string;
  make: string;
  model: string;
  year: number;
  color: string;
  colorHex: string;
  mileage: number;
  status: 'In Service' | 'Awaiting Info' | 'Ready';
  // 🌟 MAKE SURE THIS LINE IS PRESENT:
  customers: Customer[];
}

@Component({
  selector: 'app-vehicle-view',
  standalone: true,
  imports: [CommonModule, VehicleEditFormComponent, VehicleViewForm, FormsModule],
  templateUrl: './vehicle-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-view.css',
})
export class VehicleView implements OnInit {
  allVehicles: VehicleSummaryProjection[] = [];
  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  // Modal State Control Properties
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false; // 🌟 Added: Track display overlay visibility for your view form
  selectedVehicle: Vehicle | null = null;

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.fetchVehicles();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Fleet Records for Registration/Make:', inputElement.value);
  }

// 🌟 Updated: Finds target data model and pops open the read-only view form layout modal
  viewVehicle(regNo: string): void {const targetVehicle = this.allVehicles.find(v => v.vehicleRegNo === regNo);
    if (targetVehicle) {
      this.isViewModalOpen = true;
    }
  }

  editVehicle(regNo: string): void {
    const targetVehicle = this.allVehicles.find(v => v.vehicleRegNo === regNo);
    if (targetVehicle) {
      this.isEditModalOpen = true;
    }
  }

// 🌟 Updated: Re-set state tracking parameters to dismiss both edit and read-only overlay variants cleanly
  closeModal(): void {
    this.isEditModalOpen = false;
    this.isViewModalOpen = false;
    this.selectedVehicle = null;
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchVehicles(); // fetchJobCards will run cdr.markForCheck() when done
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
    const backendPage = this.currentPage - 1;

    this.adminService.getVehiclesPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).subscribe({
      next: (response: any) => {
        console.log(response);
        // Stage updates in local variables first to prevent layout thrashing
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

        // Apply properties all at once
        this.allVehicles = updatedVehicles;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        // Notify Angular to redraw on the next frame paint seamlessly
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

  protected onVehicleSaved($event: Vehicle) {

  }
}

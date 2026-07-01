import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VehicleEditFormComponent} from '../vehicle-edit-form/vehicle-edit-form';
import {VehicleViewForm} from '../vehicle-view-form/vehicle-view-form';

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
  imports: [CommonModule, VehicleEditFormComponent, VehicleViewForm],
  templateUrl: './vehicle-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-view.css',
})
export class VehicleView implements OnInit {
  allVehicles: Vehicle[] = [
    {
      regNo: 'WP CAB 1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      color: 'Black',
      colorHex: '#000000',
      mileage: 45200,
      status: 'In Service',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP ABC 5678',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      color: 'Red',
      colorHex: '#dc2626',
      mileage: 32750,
      status: 'In Service',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP KY 2345',
      make: 'Suzuki',
      model: 'Swift',
      year: 2017,
      color: 'Blue',
      colorHex: '#2563eb',
      mileage: 58100,
      status: 'Awaiting Info',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP CAH 9876',
      make: 'Mitsubishi',
      model: 'Montero',
      year: 2015,
      color: 'White',
      colorHex: '#ffffff',
      mileage: 112400,
      status: 'In Service',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP DAC 1122',
      make: 'Nissan',
      model: 'Dayz',
      year: 2020,
      color: 'Silver',
      colorHex: '#9ca3af',
      mileage: 21300,
      status: 'Ready',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP CBK 4455',
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      color: 'Soul Red',
      colorHex: '#991b1b',
      mileage: 18500,
      status: 'Ready',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP CAD 7788',
      make: 'BMW',
      model: '320i',
      year: 2016,
      color: 'Grey',
      colorHex: '#4b5563',
      mileage: 65900,
      status: 'In Service',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    },
    {
      regNo: 'WP CBB 9900',
      make: 'Mercedes',
      model: 'C200',
      year: 2017,
      color: 'White',
      colorHex: '#f3f4f6',
      mileage: 52000,
      status: 'Awaiting Info',
      customers: [{licenseNumber: '', name: 'John Doe', contactNumber: '', email: 'john@example.com', address: ''}]
    }
  ];

  displayedVehicles: Vehicle[] = [];
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number[] = [];
  maxPages: number = 1;

  // Modal State Control Properties
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false; // 🌟 Added: Track display overlay visibility for your view form
  selectedVehicle: Vehicle | null = null;

  constructor() {
  }

  ngOnInit(): void {
    this.calculatePaginationConfig();
    this.updateDisplayedVehicles();
  }

  calculatePaginationConfig(): void {
    this.maxPages = Math.ceil(this.allVehicles.length / this.pageSize);
    this.totalPages = Array.from({length: this.maxPages}, (_, i) => i + 1);
  }

  updateDisplayedVehicles(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedVehicles = this.allVehicles.slice(startIndex, endIndex);
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Fleet Records for Registration/Make:', inputElement.value);
  }

  // 🌟 Updated: Finds target data model and pops open the read-only view form layout modal
  viewVehicle(regNo: string): void {
    const targetVehicle = this.allVehicles.find(v => v.regNo === regNo);
    if (targetVehicle) {
      this.selectedVehicle = targetVehicle;
      this.isViewModalOpen = true;
    }
  }

  editVehicle(regNo: string): void {
    const targetVehicle = this.allVehicles.find(v => v.regNo === regNo);
    if (targetVehicle) {
      this.selectedVehicle = targetVehicle;
      this.isEditModalOpen = true;
    }
  }

  onVehicleSaved(updatedVehicle: Vehicle): void {
    const targetIndex = this.allVehicles.findIndex(v => v.regNo === updatedVehicle.regNo);
    if (targetIndex !== -1) {
      this.allVehicles[targetIndex] = updatedVehicle;
      this.updateDisplayedVehicles();
    }
    this.closeModal();
  }

  // 🌟 Updated: Re-set state tracking parameters to dismiss both edit and read-only overlay variants cleanly
  closeModal(): void {
    this.isEditModalOpen = false;
    this.isViewModalOpen = false;
    this.selectedVehicle = null;
  }

  /* Interactive Pagination Navigation Links */
  goToPage(page: number): void {
    this.currentPage = page;
    this.updateDisplayedVehicles();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedVehicles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.maxPages) {
      this.currentPage++;
      this.updateDisplayedVehicles();
    }
  }
}

import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core'; // Fixed: Added OnInit import
import { CommonModule } from '@angular/common';
import {CustomerProjection} from '../../../dto/response/CustomerProjection';
import {AdminService} from '../../../services/admin.service';
import {FormsModule} from '@angular/forms';

// Fixed: Added missing Customer interface definition
interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  totalJobs: number;
}

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, FormsModule], // Fixed: Added CommonModule for HTML structural directives (*ngFor, *ngIf)
  templateUrl: './customer-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './customer-view.css',
})
export class CustomerView implements OnInit { // Fixed: Added implements OnInit
  // Master customer dataset compiled from your dashboard entries
  allCustomers: CustomerProjection[] = [];

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  constructor(private readonly adminService: AdminService,private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Customers for:', inputElement.value);
  }

  viewCustomer(id: number): void { console.log('Viewing customer details profile:', id); }
  editCustomer(id: number): void { console.log('Editing customer account records:', id); }

  /* Pagination Navigation Controls */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchCustomers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchCustomers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchCustomers();
    }
  }

  private fetchCustomers() {
    const backendPage = this.currentPage - 1;

    this.adminService.getCustomersPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).subscribe({
      next: (response: any) => {
        console.log(response);
        // Stage updates in local variables first to prevent layout thrashing
        let updatedCustomers: CustomerProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.content !== undefined) {
          updatedCustomers = response.content || [];
          updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
          updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
        } else if (Array.isArray(response)) {
          updatedCustomers = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
        }

        // Apply properties all at once
        this.allCustomers = updatedCustomers;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        // Notify Angular to redraw on the next frame paint seamlessly
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load job cards from server:', err);
        this.allCustomers = [];
        this.totalElements = 0;
        this.totalPagesCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchCustomers(); // fetchCustomers will run cdr.markForCheck() when done
  }
}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerSummaryProjection } from '../../../dto/response/CustomerSummaryProjection';
import { CustomerViewAndEdit } from '../customer-view-and-edit/customer-view-and-edit';
import { NotificationService } from '../../../services/notificationService';
import { CustomerProjection } from '../../../dto/response/CustomerProjection';
import { finalize } from 'rxjs';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';
import { CustomerContactNumberEmailAndIdDTO } from '../../../dto/response/CustomerContactNumberEmailAndIdDTO';

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerViewAndEdit, ReactiveFormsModule, Dropdown],
  templateUrl: './customer-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './customer-view.css',
})
export class CustomerView implements OnInit {
  // Fixed: Added implements OnInit

  filterForm!: FormGroup;

  cutromerNameEmailIds: CustomerContactNumberEmailAndIdDTO[] = [];
  allCustomers: CustomerSummaryProjection[] = [];
  customer: CustomerProjection | undefined;

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'createdDate';
  sortDirection: string = 'desc';

  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;
  isSearch: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchCustomerNameEmailIds();
    this.fetchCustomers();
  }

  // Initialize form controls matching your backend search request DTO
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      contactNumber: [''],
      email: [''],
      activeStatus: [''],
    });
  }

  private fetchCustomerNameEmailIds(): void {
    this.adminService.getAllCustomerNameEmailIds().subscribe({
      next: (response: any) => {
        const CustomerNameEmailIds = response?.data || response;
        if (Array.isArray(CustomerNameEmailIds)) {
          this.cutromerNameEmailIds = CustomerNameEmailIds;
        } else {
          this.cutromerNameEmailIds = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load user names:', err);
        this.cutromerNameEmailIds = [];
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Customers for:', inputElement.value);
  }

  viewCustomer(customerId: number): void {
    console.log('Viewing customer details profile:', customerId);
    this.adminService.getCustomerById(customerId).subscribe({
      next: (response: any) => {
        this.customer = response.data;
        console.log(response);
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load job card from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      },
    });
  }
  editCustomer(customerId: number): void {
    this.adminService.getCustomerById(customerId).subscribe({
      next: (response: any) => {
        this.customer = response.data;
        console.log(response);
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load job card from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      },
    });
  }

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
    // Start loader
    this.isLoading = true;
    const backendPage = this.currentPage - 1;
        // Extract values directly from the form group
    const formValues = this.filterForm.value;

    this.adminService
      .getCustomersPaginated(formValues, backendPage, this.pageSize, this.sortByField, this.sortDirection)
      .pipe(
        finalize(() => {
          // Stop loader for both success and error
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: any) => {
          // Stage updates in local variables first to prevent layout thrashing
          let updatedCustomers: CustomerSummaryProjection[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (response?.data?.content !== undefined) {
            updatedCustomers = response.data.content || [];
            updatedTotalElements =
              response.data.page.totalElements === undefined
                ? response.data.total_elements || 0
                : response.data.page.totalElements;
            updatedTotalPagesCount =
              response.data.page.totalPages === undefined
                ? response.data.total_pages || 0
                : response.data.page.totalPages;
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
        },
      });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchCustomers(); // fetchCustomers will run cdr.markForCheck() when done
  }

  closeModal(): void {
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.customer = undefined;
    this.cdr.markForCheck();
  }

  search() {
    if (this.isSearch) {
      return;
    }
    this.isSearch = true;
  }

  onApplyFilters(): void {
    this.currentPage = 1; // Reset to page 1 on new filter execution
    this.fetchCustomers();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      contactNumber: '',
      email: '',
    });
    this.currentPage = 1;
    this.fetchCustomers();
  }
}

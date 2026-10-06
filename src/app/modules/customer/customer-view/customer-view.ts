import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {CustomerContactNumberEmailAndIdResponseDTO} from '../../../dto/response/CustomerContactNumberEmailAndIdResponseDTO';
import {CustomerTableViewResponseProjection} from '../../../dto/response/CustomerTableViewResponseProjection';
import {SearchDropdown} from '../../../shared/components/search-dropdown/search-dropdown';

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchDropdown],
  templateUrl: './customer-view.html',
  styleUrl: './customer-view.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CustomerView implements OnInit {

  filterForm!: FormGroup;

  cutromerNameEmailIds: CustomerContactNumberEmailAndIdResponseDTO[] = [];
  allCustomers: CustomerTableViewResponseProjection[] = [];

  currentPage = 1;
  pageSize = 5;
  totalElements = 0;
  totalPagesCount = 0;
  pageSizes = [5, 10, 20, 50];

  sortByField = 'createdDate';
  sortDirection = 'desc';

  isLoading = false;
  isSearch = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchCustomerNameEmailIds();
    this.fetchCustomers();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      contactNumber: [''],
      email: [''],
      activeStatus: ['']
    });
  }

  private fetchCustomerNameEmailIds(): void {
    this.adminService.getAllCustomerNameEmailIds().subscribe({
      next: (response: any) => {
        const customerNameEmailIds = response?.data || response;

        this.cutromerNameEmailIds =
          Array.isArray(customerNameEmailIds)
            ? customerNameEmailIds
            : [];

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load customer names:', err);

        this.cutromerNameEmailIds = [];
        this.cdr.markForCheck();
      }
    });
  }

  viewCustomer(customerId: number): void {
    this.router.navigate(
      ['/dashboard/customers/view', customerId],
      {state: {mode: 'view'}}
    );
  }

  editCustomer(customerId: number): void {
    this.router.navigate(
      ['/dashboard/customers/edit', customerId],
      {state: {mode: 'edit'}}
    );
  }

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

  private fetchCustomers(): void {
    this.isLoading = true;

    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    this.adminService.getCustomersPaginated(
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
        let updatedCustomers: CustomerTableViewResponseProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.data?.content !== undefined) {
          updatedCustomers = response.data.content || [];

          updatedTotalElements =
            response.data.page?.totalElements ??
            response.data.total_elements ??
            0;

          updatedTotalPagesCount =
            response.data.page?.totalPages ??
            response.data.total_pages ??
            0;

        } else if (Array.isArray(response)) {
          updatedCustomers = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount =
            Math.ceil(response.length / this.pageSize) || 1;
        }

        this.allCustomers = updatedCustomers;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load customers:', err);

        this.allCustomers = [];
        this.totalElements = 0;
        this.totalPagesCount = 0;

        this.notificationService.show(
          'Failed to load customers.',
          'error'
        );

        this.cdr.markForCheck();
      }
    });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize = Number(select.value);
    this.currentPage = 1;

    this.fetchCustomers();
  }

  onApplyFilters(): void {
    this.currentPage = 1;
    this.fetchCustomers();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      contactNumber: '',
      email: '',
      activeStatus: ''
    });

    this.currentPage = 1;
    this.fetchCustomers();
  }

  search(): void {
    if (this.isSearch) return;

    this.isSearch = true;
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Customers for:', inputElement.value);
  }
}

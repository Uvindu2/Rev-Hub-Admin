import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InvoiceTableViewResponseProjection} from '../../../dto/response/InvoiceTableViewResponseProjection';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {finalize} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceView implements OnInit {

  invoices: InvoiceTableViewResponseProjection[] = [];

  filterForm!: FormGroup;

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'invoiceId';
  sortDirection: string = 'desc';

  isLoading: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchInvoices();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      paymentStatus: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  fetchInvoices(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    // Use search endpoint passing filters in body, pageable config in URL params
    this.adminService.searchInvoices(formValues, backendPage, this.pageSize, this.sortByField, this.sortDirection)
      .pipe(
        finalize(() => {
          // Stop loader for both success and error
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          let pageData = response.data || response;

          // Stage updates in local variables first to prevent layout thrashing
          let updatedInvoicesSummary: InvoiceTableViewResponseProjection[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (pageData?.content !== undefined) {
            updatedInvoicesSummary = pageData.content || [];

            // Fallback check for different Spring Data Page serialization structures
            if (pageData.page) {
              updatedTotalElements = pageData.page.totalElements ?? pageData.page.total_elements ?? 0;
              updatedTotalPagesCount = pageData.page.totalPages ?? pageData.page.total_pages ?? 0;
            } else {
              updatedTotalElements = pageData.totalElements ?? pageData.total_elements ?? 0;
              updatedTotalPagesCount = pageData.totalPages ?? pageData.total_pages ?? 0;
            }
          } else if (Array.isArray(pageData)) {
            updatedInvoicesSummary = pageData;
            updatedTotalElements = pageData.length;
            updatedTotalPagesCount = Math.ceil(pageData.length / this.pageSize) || 1;
          }

          // Apply properties all at once
          this.invoices = updatedInvoicesSummary;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          // Notify Angular to redraw on the next frame paint seamlessly
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load invoices from server:', err);
          this.invoices = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;
          this.cdr.markForCheck();
        }
      });
  }

  onApplyFilters(): void {
    this.currentPage = 1;
    this.fetchInvoices();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    this.currentPage = 1;
    this.fetchInvoices();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchInvoices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchInvoices();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchInvoices();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchInvoices();
    }
  }

  onAddInvoice(): void {
    this.router.navigate(['/dashboard/invoices/new']);
  }

  editInvoice(invoiceId: number): void {
    this.router.navigate(['/dashboard/invoices/edit', invoiceId]);
  }

  viewInvoice(invoiceId: number): void {
    this.router.navigate(['/dashboard/pdf-preview/invoice', invoiceId]);
  }

  onGen() {
    this.adminService.gen().subscribe({
      next: (res: any) => {
        console.log(res);
        this.notificationService.show(res, 'success');
      },
      error: (err: any) => {
        console.error('Invoice PDF loading error:', err);
        this.notificationService.show('Failed to load invoice PDF.', 'error');
      }
    });
  }
}

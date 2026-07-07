import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InvoiceForm} from '../invoice-form/invoice-form';
import {InvoiceSummaryProjection} from '../../../dto/InvoiceSummaryProjection';
import {AdminService} from '../../../services/admin.service';
import {JobCardForm} from '../../job-card/job-card-form/job-card-form';
import {ReactiveFormsModule} from '@angular/forms';

// Define the missing Invoice interface
interface Invoice {
  id: string;
  relatedJobCard: string;
  customerName: string;
  amount: number;
  dateIssued: string;
  paymentStatus: 'Paid' | 'Pending';
}

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, InvoiceForm, ReactiveFormsModule],
  templateUrl: './invoice-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit {
  // Mock data mirroring the All Invoices table
  invoices: InvoiceSummaryProjection[] = [];

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  isEditModalOpen: boolean = false;

  constructor(private readonly cdr: ChangeDetectorRef,private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchInvoices();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Invoices for:', inputElement.value);
  }

  viewInvoice(id: number): void {
    console.log('Viewing invoice:', id);
  }

  printInvoice(id: number): void {
    console.log('Printing/Downloading invoice:', id);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) this.currentPage++;
  }

  protected onAddInvoice(): void {
    this.isEditModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.cdr.markForCheck();
  }

   fetchInvoices() {
     const backendPage = this.currentPage - 1;

     this.adminService.getInvoiceSummaryPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).subscribe({
       next: (response: any) => {
         console.log(response);
         // Stage updates in local variables first to prevent layout thrashing
         let updatedInvoicesSummary: InvoiceSummaryProjection[] = [];
         let updatedTotalElements = 0;
         let updatedTotalPagesCount = 0;

         if (response?.content !== undefined) {
           updatedInvoicesSummary = response.content || [];
           updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
           updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
         } else if (Array.isArray(response)) {
           updatedInvoicesSummary = response;
           updatedTotalElements = response.length;
           updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
         }

         // Apply properties all at once
         this.invoices = updatedInvoicesSummary;
         this.totalElements = updatedTotalElements;
         this.totalPagesCount = updatedTotalPagesCount;

         // Notify Angular to redraw on the next frame paint seamlessly
         this.cdr.markForCheck();
       },
       error: (err: any) => {
         console.error('Failed to load job cards from server:', err);
         this.invoices = [];
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
    this.fetchInvoices(); // fetchJobCards will run cdr.markForCheck() when done
  }
}

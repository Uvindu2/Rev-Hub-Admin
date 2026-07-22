import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InvoiceForm} from '../invoice-form/invoice-form';
import {InvoiceSummaryProjection} from '../../../dto/InvoiceSummaryProjection';
import {AdminService} from '../../../services/admin.service';
import JobCardForm from '../../job-card/job-card-form/job-card-form';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NotificationService} from '../../../services/notificationService';

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
  imports: [CommonModule, InvoiceForm, ReactiveFormsModule, FormsModule],
  templateUrl: './invoice-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit {
  // Mock data mirroring the All Invoices table
  invoices: InvoiceSummaryProjection[] = [];

  // Filter Bindings
  searchTerm: string = '';
  selectedVehicle: string = '';
  selectedTechnician: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  availableVehicles: string[] = ['CAH-1331', 'CAH-1231'];
  availableTechnicians: string[] = ['Sarah Connor', 'Alex Smith', 'David Miller'];

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

  constructor(private readonly cdr: ChangeDetectorRef,private readonly adminService: AdminService,private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchInvoices();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Invoices for:', inputElement.value);
  }

  viewInvoice(invoiceId: number): void {
    const viewerTab = window.open('about:blank', '_blank');

    if (viewerTab) {
      viewerTab.document.write('<p style="font-family:sans-serif; text-align:center; margin-top:20px;">Loading PDF...</p>');
    }

    this.adminService.viewInvoice(invoiceId).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the binary blob
        const url = window.URL.createObjectURL(blob);

        if (viewerTab) {
          viewerTab.location.href = url;
        }

        // Optional: Clean up memory after 1 minute
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      error: (err) => {
        console.error('Download error:', err);
        if (viewerTab) viewerTab.close();
        this.notificationService.show('Error: Unable to load the PDF.', 'error');
      }
    });
  }

// 2. PRINT FUNCTION: Triggers browser print dialog directly
  printInvoice(invoiceId: number): void {
    this.adminService.viewInvoice(invoiceId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        // Create a hidden iframe to print
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          // Trigger the print dialog
          iframe.contentWindow?.print();

          // Cleanup after a delay
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
      },
      error: () => {
        this.notificationService.show('Failed to print invoice', 'error');
      }
    });
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

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  onApplyFilters(): void {
    console.log('Applying filters:', {
      search: this.searchTerm,
      vehicle: this.selectedVehicle,
      technician: this.selectedTechnician,
      status: this.selectedStatus,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    });
    this.currentPage = 1;
    this.fetchInvoices();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedVehicle = '';
    this.selectedTechnician = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.fetchInvoices();
  }

}

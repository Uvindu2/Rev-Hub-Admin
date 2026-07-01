import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InvoiceForm} from '../invoice-form/invoice-form';

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
  imports: [CommonModule, InvoiceForm],
  templateUrl: './invoice-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit {
  // Mock data mirroring the All Invoices table
  invoices: Invoice[] = [
    { id: 'INV-00045', relatedJobCard: 'JC-00012', customerName: 'Nimal Perera', amount: 35200.00, dateIssued: '20 May 2024', paymentStatus: 'Paid' },
    { id: 'INV-00044', relatedJobCard: 'JC-00011', customerName: 'Kamal Fernando', amount: 18750.00, dateIssued: '19 May 2024', paymentStatus: 'Pending' },
    { id: 'INV-00043', relatedJobCard: 'JC-00013', customerName: 'Saman Jayawar-', amount: 22000.00, dateIssued: '19 May 2024', paymentStatus: 'Paid' },
    { id: 'INV-00042', relatedJobCard: 'JC-00011', customerName: 'Lahiru Silva', amount: 15500.00, dateIssued: '19 May 2024', paymentStatus: 'Pending' },
    { id: 'INV-00041', relatedJobCard: 'JC-00008', customerName: 'Darshana Kumara', amount: 15800.00, dateIssued: '17 May 2024', paymentStatus: 'Pending' },
    { id: 'INV-00040', relatedJobCard: 'JC-00006', customerName: 'Lahiru Silva', amount: 15500.00, dateIssued: '19 May 2024', paymentStatus: 'Pending' },
    { id: 'INV-00039', relatedJobCard: 'JC-00005', customerName: 'Darshana Kumara', amount: 15800.00, dateIssued: '17 May 2024', paymentStatus: 'Pending' },
    { id: 'INV-00038', relatedJobCard: 'JC-00001', customerName: 'Lahiru Silva', amount: 15500.00, dateIssued: '19 May 2024', paymentStatus: 'Pending' }
  ];

  currentPage: number = 2;
  totalPages: number[] = [1, 2];
  maxPages: number = 2;

  isEditModalOpen: boolean = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Invoices for:', inputElement.value);
  }

  viewInvoice(id: string): void {
    console.log('Viewing invoice:', id);
  }

  printInvoice(id: string): void {
    console.log('Printing/Downloading invoice:', id);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.maxPages) this.currentPage++;
  }

  protected onAddInvoice(): void {
    this.isEditModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.cdr.markForCheck();
  }
}

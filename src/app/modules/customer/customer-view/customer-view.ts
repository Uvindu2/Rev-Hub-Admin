import { Component, OnInit } from '@angular/core'; // Fixed: Added OnInit import
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule], // Fixed: Added CommonModule for HTML structural directives (*ngFor, *ngIf)
  templateUrl: './customer-view.html',
  styleUrl: './customer-view.css',
})
export class CustomerView implements OnInit { // Fixed: Added implements OnInit
  // Master customer dataset compiled from your dashboard entries
  allCustomers: Customer[] = [
    { id: 'CUST-0001', name: 'Nimal Perera', contactNumber: '+94 77 123 4567', email: 'nimal.perera@gmail.com', totalJobs: 2 },
    { id: 'CUST-0002', name: 'Kamal Fernando', contactNumber: '+94 71 987 6543', email: 'kamalfernando@yahoo.com', totalJobs: 2 },
    { id: 'CUST-0003', name: 'Saman Jayawardena', contactNumber: '+94 75 444 3322', email: 'saman.j@outlook.com', totalJobs: 1 },
    { id: 'CUST-0004', name: 'Lahiru Silva', contactNumber: '+94 72 555 6677', email: 'lahiru.silva@live.com', totalJobs: 3 },
    { id: 'CUST-0005', name: 'Darshana Kumara', contactNumber: '+94 76 888 9900', email: 'darshana.k@gmail.com', totalJobs: 2 },
    { id: 'CUST-0006', name: 'Anura De Silva', contactNumber: '+94 70 333 4455', email: 'anura.desilva@gmail.com', totalJobs: 1 },
    { id: 'CUST-0007', name: 'Priyantha Bandara', contactNumber: '+94 78 222 1100', email: 'priyantha.b@yahoo.com', totalJobs: 1 },
    { id: 'CUST-0008', name: 'Sunil Shantha', contactNumber: '+94 74 666 7788', email: 'sunil.sh@live.com', totalJobs: 2 }
  ];

  displayedCustomers: Customer[] = [];
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number[] = [];
  maxPages: number = 1;

  constructor() {}

  ngOnInit(): void {
    this.calculatePaginationConfig();
    this.updateDisplayedCustomers();
  }

  calculatePaginationConfig(): void {
    this.maxPages = Math.ceil(this.allCustomers.length / this.pageSize);
    this.totalPages = Array.from({ length: this.maxPages }, (_, i) => i + 1);
  }

  updateDisplayedCustomers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedCustomers = this.allCustomers.slice(startIndex, endIndex);
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Customers for:', inputElement.value);
  }

  viewCustomer(id: string): void { console.log('Viewing customer details profile:', id); }
  editCustomer(id: string): void { console.log('Editing customer account records:', id); }

  /* Pagination Navigation Controls */
  goToPage(page: number): void { this.currentPage = page; this.updateDisplayedCustomers(); }
  prevPage(): void { if(this.currentPage > 1) { this.currentPage--; this.updateDisplayedCustomers(); } }
  nextPage(): void { if(this.currentPage < this.maxPages) { this.currentPage++; this.updateDisplayedCustomers(); } }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'; // Fixed: Added OnInit import
import { CommonModule } from '@angular/common'; // Fixed: Added CommonModule import

// Fixed: Added missing Technician interface definition
interface Technician {
  id: string;
  name: string;
  specialty: string;
  activeJobs: number;
  status: 'Available' | 'Busy' | 'On Leave';
}

@Component({
  selector: 'app-technician-view',
  standalone: true,
  imports: [CommonModule], // Fixed: Added CommonModule for table structural bindings (*ngFor, ngClass)
  templateUrl: './technician-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './technician-view.css',
})
export class TechnicianView implements OnInit { // Fixed: Added implements OnInit
  // Balanced 8-record technician dataset matching your system framework
  allTechnicians: Technician[] = [
    { id: 'TECH-0001', name: 'Alex P.', specialty: 'Engine Tune-ups & Diagnostics', activeJobs: 3, status: 'Busy' },
    { id: 'TECH-0002', name: 'Sam K.', specialty: 'Brake Systems & Suspension', activeJobs: 2, status: 'Busy' },
    { id: 'TECH-0003', name: 'Nimal P.', specialty: 'Electrical & Wiring Specialist', activeJobs: 0, status: 'Available' },
    { id: 'TECH-0004', name: 'Ravi R.', specialty: 'Auto Detailing & Paint Correction', activeJobs: 1, status: 'Busy' },
    { id: 'TECH-0005', name: 'Asanka J.', specialty: 'Wheel Alignment & Balancing', activeJobs: 0, status: 'On Leave' },
    { id: 'TECH-0006', name: 'Michael S.', specialty: 'Transmission Systems Repair', activeJobs: 0, status: 'Available' },
    { id: 'TECH-0007', name: 'Chandana K.', specialty: 'Air Conditioning & Cooling Tech', activeJobs: 2, status: 'Busy' },
    { id: 'TECH-0008', name: 'Kasun T.', specialty: 'General Mechanical Maintenance', activeJobs: 0, status: 'Available' }
  ];

  displayedTechnicians: Technician[] = [];
  currentPage: number = 1;
  pageSize: number = 8; // Formats cleanly into 5 items per page view
  totalPages: number[] = [];
  maxPages: number = 1;

  constructor() {}

  ngOnInit(): void {
    this.calculatePaginationConfig();
    this.updateDisplayedInvoices();
  }

  calculatePaginationConfig(): void {
    this.maxPages = Math.ceil(this.allTechnicians.length / this.pageSize);
    this.totalPages = Array.from({ length: this.maxPages }, (_, i) => i + 1);
  }

  updateDisplayedInvoices(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedTechnicians = this.allTechnicians.slice(startIndex, endIndex);
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Searching Technicians for:', inputElement.value);
  }

  viewTech(id: string): void { console.log('Viewing schedule matrix for:', id); }
  editTech(id: string): void { console.log('Editing technician payload metrics for:', id); }

  /* Navigation Links pagination rules */
  goToPage(page: number): void { this.currentPage = page; this.updateDisplayedInvoices(); }
  prevPage(): void { if(this.currentPage > 1) { this.currentPage--; this.updateDisplayedInvoices(); } }
  nextPage(): void { if(this.currentPage < this.maxPages) { this.currentPage++; this.updateDisplayedInvoices(); } }
}

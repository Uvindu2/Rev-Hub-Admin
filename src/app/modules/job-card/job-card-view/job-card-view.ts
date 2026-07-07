import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {JobCardForm} from '../job-card-form/job-card-form';
import {AdminService} from '../../../services/admin.service';
import {JobCardViewAndEdit} from '../job-card-view-and-edit/job-card-view-and-edit';
import {NotificationService} from '../../../services/notificationService';

@Component({
  selector: 'app-job-card-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JobCardForm, JobCardViewAndEdit],
  templateUrl: './job-card-view.html',
  styleUrl: './job-card-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Explicitly managing manual renders
})
export class JobCardView implements OnInit {

  jobCards: JobCardProjection[] = [];
  jobCard: JobCardProjection | undefined;

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
  isViewAndEditModalOpen: boolean = false;

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef, // Injecting manual render utility
  private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.fetchJobCards();
  }

  fetchJobCards(): void {
    const backendPage = this.currentPage - 1;

    this.adminService.getJobCardsPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).subscribe({
      next: (response: any) => {
        console.log(response);
        // Stage updates in local variables first to prevent layout thrashing
        let updatedJobCards: JobCardProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.content !== undefined) {
          updatedJobCards = response.content || [];
          updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
          updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
        } else if (Array.isArray(response)) {
          updatedJobCards = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
        }

        // Apply properties all at once
        this.jobCards = updatedJobCards;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        // Notify Angular to redraw on the next frame paint seamlessly
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load job cards from server:', err);
        this.jobCards = [];
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
    this.fetchJobCards(); // fetchJobCards will run cdr.markForCheck() when done
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchJobCards();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchJobCards();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchJobCards();
    }
  }

  // Local action triggers require instant local checks
  onAddJobCard(): void {
    this.isEditModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.isViewAndEditModalOpen = false;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    console.log('Searching...');
  }

  viewJob(id: number): void {
    console.log('Viewing ID:', id);

    this.adminService.getJobCardById(id).subscribe({
      next: (response: any) => {
        this.jobCard = response.data;
        console.log(response);
        this.isViewAndEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load job card from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
    });
  }

  editJob(id: number): void {
    this.isViewAndEditModalOpen = true;
  }

  deleteJob(id: number): void {
    console.log('Deleting ID:', id);
  }
}

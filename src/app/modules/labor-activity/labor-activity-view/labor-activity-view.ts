import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {LaborActivityForm} from '../labor-activity-form/labor-activity-form';
import {LaborActivityProjection} from '../../../dto/response/LaborActivityProjection';
import { LaborActivityViewAndEdit } from "../labor-activity-view-and-edit/labor-activity-view-and-edit";
import {finalize} from 'rxjs';

@Component({
  selector: 'app-labor-activity-view',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    LaborActivityForm,
    LaborActivityViewAndEdit
],
  templateUrl: './labor-activity-view.html',
  styleUrl: './labor-activity-view.css',
})
export class LaborActivityView implements OnInit {

  laborActivities: LaborActivityProjection[] = [];
  laborActivity: LaborActivityProjection | undefined;

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'dateAdded';
  sortDirection: string = 'desc';

  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef, // Injecting manual render utility
    private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.fetchLaborActivities();
  }

  fetchLaborActivities(): void {

    // Start loader
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;

    this.adminService.getLaborActivitiesPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).pipe(
      finalize(() => {
        // Stop loader for both success and error
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {
        console.log(response);
        // Stage updates in local variables first to prevent layout thrashing
        let updatedLaborActivities: LaborActivityProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.content !== undefined) {
          updatedLaborActivities = response.content || [];
          updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
          updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
        } else if (Array.isArray(response)) {
          updatedLaborActivities = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
        }

        // Apply properties all at once
        this.laborActivities = updatedLaborActivities;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        // Notify Angular to redraw on the next frame paint seamlessly
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load labor Activities from server:', err);
        this.laborActivities = [];
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
    this.fetchLaborActivities(); // fetchLaborActivities will run cdr.markForCheck() when done
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchLaborActivities();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchLaborActivities();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchLaborActivities();
    }
  }

  // Local action triggers require instant local checks
  onAddLaborActivity(): void {
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.laborActivity = undefined;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    console.log('Searching...');
  }

  viewLaborActivity(id: number): void {
    console.log('Viewing ID:', id);

    this.adminService.getLaborActivityById(id).subscribe({
      next: (response: any) => {
        this.laborActivity = response.data;
        console.log(response);
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load labor activities from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
    });
  }

  editLaborActivity(id: number): void {
    this.adminService.getLaborActivityById(id).subscribe({
      next: (response: any) => {
        this.laborActivity = response.data;
        console.log(response);
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load labor activities from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
    });
  }

  deleteLaborActivity(id: number): void {
    console.log('Deleting ID:', id);
  }
}

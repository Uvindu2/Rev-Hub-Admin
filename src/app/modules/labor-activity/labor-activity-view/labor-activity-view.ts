import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, finalize, Subject, takeUntil} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {LaborActivityTableViewResponseProjection} from '../../../dto/response/LaborActivityTableViewResponseProjection';
import {LaborActivityNameResponseProjection} from '../../../dto/response/LaborActivityNameResponseProjection';

import {SearchDropdown} from '../../../shared/components/search-dropdown/search-dropdown';

@Component({
  selector: 'app-labor-activity-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    SearchDropdown
  ],
  templateUrl: './labor-activity-view.html',
  styleUrl: './labor-activity-view.css'
})
export class LaborActivityView implements OnInit, OnDestroy {

  filterForm!: FormGroup;

  laborActivities: LaborActivityTableViewResponseProjection[] = [];
  laborActivityNameProjection: LaborActivityNameResponseProjection[] = [];

  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  sortByField: string = 'createdDate';
  sortDirection: string = 'desc';

  isLoading: boolean = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchLaborActivityNames();
    this.setupFilterListener();
    this.fetchLaborActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchLaborActivityNames(): void {
    this.adminService.getLaborActivityNames().subscribe({
      next: (res: any) => {
        const data = res?.data || res;

        this.laborActivityNameProjection =
          Array.isArray(data) ? data : [];

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load labor activity names:', err);
        this.laborActivityNameProjection = [];
        this.cdr.markForCheck();
      }
    });
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      laborActivity: [null]
    });
  }

  private setupFilterListener(): void {
    this.filterForm
      .get('laborActivity')
      ?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchLaborActivities();
      });
  }

  fetchLaborActivities(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;
    const rawActivityId =
      this.filterForm.get('laborActivity')?.value;

    const selectedActivityId =
      rawActivityId === '' ||
      rawActivityId === undefined ||
      rawActivityId === null
        ? null
        : rawActivityId;

    this.adminService
      .getLaborActivitiesPaginated(
        backendPage,
        this.pageSize,
        this.sortByField,
        this.sortDirection,
        selectedActivityId
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          let updatedLaborActivities: LaborActivityTableViewResponseProjection[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (response?.data?.content !== undefined) {
            updatedLaborActivities =
              response.data.content || [];

            updatedTotalElements =
              response.data.page?.totalElements === undefined
                ? response.data.total_elements || 0
                : response.data.page.totalElements;

            updatedTotalPagesCount =
              response.data.page?.totalPages === undefined
                ? response.data.total_pages || 0
                : response.data.page.totalPages;

          } else if (Array.isArray(response)) {
            updatedLaborActivities = response;
            updatedTotalElements = response.length;
            updatedTotalPagesCount =
              Math.ceil(response.length / this.pageSize) || 1;
          }

          this.laborActivities = updatedLaborActivities;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          this.cdr.markForCheck();
        },

        error: (err: any) => {
          console.error(
            'Failed to load labor activities from server:',
            err
          );

          this.laborActivities = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;

          this.cdr.markForCheck();
        }
      });
  }

  onAddLaborActivity(): void {
    this.router.navigate(['/dashboard/labor-activities/new']);
  }

  viewLaborActivity(id: number): void {
    this.router.navigate(['/dashboard/labor-activities/view', id]);
  }

  editLaborActivity(id: number): void {
    this.router.navigate(['/dashboard/labor-activities/edit', id]);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize = Number(select.value);
    this.currentPage = 1;

    this.fetchLaborActivities();
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

  setActiveInactive(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }
}

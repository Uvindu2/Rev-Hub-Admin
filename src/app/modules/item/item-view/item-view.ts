import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, finalize, Subject, takeUntil} from 'rxjs';

import {AdminService} from '../../../services/admin.service';
import {ItemTableViewResponseProjection} from '../../../dto/response/ItemTableViewResponseProjection';
import {ItemIdNameResponseDTO} from '../../../dto/response/ItemIdNameResponseDTO';
import {SearchDropdown} from '../../../shared/components/search-dropdown/search-dropdown';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    SearchDropdown
  ],
  templateUrl: './item-view.html',
  styleUrl: './item-view.css'
})
export class ItemView implements OnInit, OnDestroy {

  filterForm!: FormGroup;

  items: ItemTableViewResponseProjection[] = [];

  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  sortByField: string = 'createdDate';
  sortDirection: string = 'desc';

  isLoading: boolean = false;

  availableItemNames: ItemIdNameResponseDTO[] = [];

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
    this.fetchItemsNames();
    this.setupFilterListener();
    this.fetchItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      itemName: [null]
    });
  }

  private setupFilterListener(): void {
    this.filterForm
      .get('itemName')
      ?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchItems();
      });
  }

  private fetchItemsNames(): void {
    this.adminService.getAllItemsNames().subscribe({
      next: (response: any) => {
        const itemsNames = response?.data || response;

        this.availableItemNames = Array.isArray(itemsNames)
          ? itemsNames
          : [];

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load item names:', err);
        this.availableItemNames = [];
        this.cdr.markForCheck();
      }
    });
  }

  fetchItems(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;
    const selectedItemId = this.filterForm.get('itemName')?.value;

    this.adminService
      .getItemsPaginated(
        backendPage,
        this.pageSize,
        this.sortByField,
        this.sortDirection,
        selectedItemId ? Number(selectedItemId) : null
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          let updatedItems: ItemTableViewResponseProjection[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (response?.data?.content !== undefined) {
            updatedItems = response.data.content || [];

            updatedTotalElements =
              response.data.page?.totalElements === undefined
                ? response.data.total_elements || 0
                : response.data.page.totalElements;

            updatedTotalPagesCount =
              response.data.page?.totalPages === undefined
                ? response.data.total_pages || 0
                : response.data.page.totalPages;

          } else if (Array.isArray(response)) {
            updatedItems = response;
            updatedTotalElements = response.length;
            updatedTotalPagesCount =
              Math.ceil(response.length / this.pageSize) || 1;
          }

          this.items = updatedItems;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          this.cdr.markForCheck();
        },

        error: (err: any) => {
          console.error('Failed to load items from server:', err);

          this.items = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;

          this.cdr.markForCheck();
        }
      });
  }

  onAddItem(): void {
    this.router.navigate(['/dashboard/items/new']);
  }

  viewItem(id: number): void {
    this.router.navigate(['/dashboard/items/view', id]);
  }

  editItem(id: number): void {
    this.router.navigate(['/dashboard/items/edit', id]);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize = Number(select.value);
    this.currentPage = 1;

    this.fetchItems();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchItems();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchItems();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchItems();
    }
  }
}

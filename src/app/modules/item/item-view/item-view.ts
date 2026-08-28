import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { ItemProjection } from '../../../dto/response/ItemProjection';
import { ItemForm } from '../item-form/item-form';
import { ItemViewAndEdit } from '../item-view-and-edit/item-view-and-edit';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';
import { ItemNameDTO } from '../../../dto/response/ItemNameDTO';

@Component({
  selector: 'app-item-view',
  imports: [ItemForm, NgForOf, NgIf, ReactiveFormsModule, ItemViewAndEdit, Dropdown],
  templateUrl: './item-view.html',
  styleUrl: './item-view.css',
})
export class ItemView implements OnInit, OnDestroy {
  filterForm!: FormGroup;

  items: ItemProjection[] = [];
  item: ItemProjection | undefined;

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  // Sorting Rules configuration
  sortByField: string = 'createdDate';
  sortDirection: string = 'desc';

  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;
  availableItemNames: ItemNameDTO[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
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
      itemName: [null],
    });
  }

  private setupFilterListener(): void {
    this.filterForm
      .get('itemName')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1; // Reset to page 1 on filter change
        this.fetchItems();
      });
  }

  private fetchItemsNames(): void {
    this.adminService.getAllItemsNames().subscribe({
      next: (response: any) => {
        const itemsNames = response?.data || response;

        if (Array.isArray(itemsNames)) {
          this.availableItemNames = itemsNames;
        } else {
          this.availableItemNames = [];
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load item names:', err);
        this.availableItemNames = [];
        this.cdr.markForCheck();
      },
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
        }),
      )
      .subscribe({
        next: (response: any) => {
          let updatedItems: ItemProjection[] = [];
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
            updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
          }

          this.items = updatedItems;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load item from server:', err);
          this.items = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;
          this.cdr.markForCheck();
        },
      });
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

  onAddItem(): void {
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.item = undefined;
    this.cdr.markForCheck();
  }

  viewItem(id: number): void {
    this.adminService.getItemById(id).subscribe({
      next: (response: any) => {
        this.item = response.data;
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        setTimeout(() => {
          this.notificationService.show('Failed to load item from server:', 'error');
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  editItem(id: number): void {
    this.adminService.getItemById(id).subscribe({
      next: (response: any) => {
        this.item = response.data;
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        setTimeout(() => {
          this.notificationService.show('Failed to load item from server:', 'error');
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  deleteItem(id: number): void {
    console.log('Deleting ID:', id);
  }
}

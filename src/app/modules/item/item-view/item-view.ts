import {ChangeDetectorRef, Component} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {ItemProjection} from '../../../dto/response/ItemProjection';
import {ItemForm} from '../item-form/item-form';
import { ItemViewAndEdit } from "../item-view-and-edit/item-view-and-edit";

@Component({
  selector: 'app-item-view',
  imports: [
    ItemForm,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ItemViewAndEdit
],
  templateUrl: './item-view.html',
  styleUrl: './item-view.css',
})
export class ItemView {

  items: ItemProjection[] = [];
  item: ItemProjection | undefined;

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

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef, // Injecting manual render utility
    private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    const backendPage = this.currentPage - 1;

    this.adminService.getItemsPaginated(backendPage, this.pageSize, this.sortByField, this.sortDirection).subscribe({
      next: (response: any) => {
        console.log(response);
        // Stage updates in local variables first to prevent layout thrashing
        let updatedItems: ItemProjection[] = [];
        let updatedTotalElements = 0;
        let updatedTotalPagesCount = 0;

        if (response?.content !== undefined) {
          updatedItems = response.content || [];
          updatedTotalElements = response.page.totalElements === undefined ? (response.total_elements || 0) : response.page.totalElements;
          updatedTotalPagesCount = response.page.totalPages === undefined ? (response.total_pages || 0) : response.page.totalPages;
        } else if (Array.isArray(response)) {
          updatedItems = response;
          updatedTotalElements = response.length;
          updatedTotalPagesCount = Math.ceil(response.length / this.pageSize) || 1;
        }

        // Apply properties all at once
        this.items = updatedItems;
        this.totalElements = updatedTotalElements;
        this.totalPagesCount = updatedTotalPagesCount;

        // Notify Angular to redraw on the next frame paint seamlessly
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load item from server:', err);
        this.items = [];
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
    this.fetchItems(); // fetchItems will run cdr.markForCheck() when done
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

  // Local action triggers require instant local checks
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

  onSearch(event: Event): void {
    console.log('Searching...');
  }

  viewItem(id: number): void {
    console.log('Viewing ID:', id);

    this.adminService.getItemById(id).subscribe({
      next: (response: any) => {
        this.item = response.data;
        console.log(response);
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load item from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
    });
  }

  editItem(id: number): void {
    this.adminService.getItemById(id).subscribe({
      next: (response: any) => {
        this.item = response.data;
        console.log(response);
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        setTimeout(() => {
          this.notificationService.show('Failed to load item from server:', 'error');
          this.cdr.detectChanges(); // Tell Angular: "A message was just added, repaint the UI now!"
        }, 0);
      }
    });
  }

  deleteItem(id: number): void {
    console.log('Deleting ID:', id);
  }
}

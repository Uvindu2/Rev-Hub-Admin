import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { UserForm } from '../user-form/user-form';
import { UserViewAndEdit } from '../user-view-and-edit/user-view-and-edit';
import { UserResponseDTO } from '../../../dto/response/UserResponseDTO';
import { finalize } from 'rxjs';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';
import { UserIdNameDto } from '../../../dto/response/UserIdNameDto';

@Component({
  selector: 'app-user-view',
  imports: [NgForOf, NgIf, ReactiveFormsModule, UserForm, UserViewAndEdit, FormsModule, Dropdown, NgClass],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
})
export class UserView implements OnInit {
  users: UserResponseDTO[] = [];
  user: UserResponseDTO | undefined;
  userIdNameDtos: UserIdNameDto[] = [];
  userRoleNameAndIds: string[] = [];

  filterForm!: FormGroup;

  // Pagination Parameters
  currentPage: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPagesCount: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];

  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  isLoading: boolean = false;
  isSearch: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchUserNames();
    this.fetchUserRoles();
    this.fetchUsers();
  }

  private fetchUserNames(): void {
    this.adminService.getAllUserNames().subscribe({
      next: (response: any) => {
        const UserIdNameDtos = response?.data || response;
        if (Array.isArray(UserIdNameDtos)) {
          this.userIdNameDtos = UserIdNameDtos;
        } else {
          this.userIdNameDtos = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load user names:', err);
        this.userIdNameDtos = [];
        this.cdr.markForCheck();
      },
    });
  }

  private fetchUserRoles(): void {
    this.adminService.getAllUserRoles().subscribe({
      next: (response: any) => {
        const UserRoles = response?.data || response;
        if (Array.isArray(UserRoles)) {
          this.userRoleNameAndIds = UserRoles;
        } else {
          this.userRoleNameAndIds = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load user roles:', err);
        this.userRoleNameAndIds = [];
        this.cdr.markForCheck();
      },
    });
  }

  // Initialize form controls matching your backend search request DTO
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      userId: [''],
      activeStatus: [''],
      roleId: [''],
    });
  }

  fetchUsers(): void {
    // Start loader
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;

    // Extract values directly from the form group
    const formValues = this.filterForm.value;

    // Send POST request with body parameters and query parameters for pagination
    this.adminService
      .searchUsers(formValues, backendPage, this.pageSize, 'userId', 'desc')
      .pipe(
        finalize(() => {
          // Stop loader for both success and error
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);

          // Extract page data safely from response.data or response fallback
          let pageData = response?.data || response;

          // Stage updates in local variables first to prevent layout thrashing
          let updatedUsers: UserResponseDTO[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (pageData?.content !== undefined) {
            updatedUsers = pageData.content || [];

            // Handle various Spring Data Page or custom wrapper response formats safely
            if (pageData.page) {
              updatedTotalElements =
                pageData.page.totalElements ?? pageData.page.total_elements ?? 0;
              updatedTotalPagesCount = pageData.page.totalPages ?? pageData.page.total_pages ?? 0;
            } else {
              updatedTotalElements = pageData.totalElements ?? pageData.total_elements ?? 0;
              updatedTotalPagesCount = pageData.totalPages ?? pageData.total_pages ?? 0;
            }
          } else if (Array.isArray(pageData)) {
            updatedUsers = pageData;
            updatedTotalElements = pageData.length;
            updatedTotalPagesCount = Math.ceil(pageData.length / this.pageSize) || 1;
          }

          // Apply properties all at once
          this.users = updatedUsers;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          // Notify Angular to redraw on the next frame paint seamlessly
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load user cards from server:', err);
          this.users = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;
          this.cdr.markForCheck();
        },
      });
  }

  onApplyFilters(): void {
    this.currentPage = 1; // Reset to page 1 on new filter execution
    this.fetchUsers();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      search: '',
      vehicle: '',
      technician: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    this.currentPage = 1;
    this.fetchUsers();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.fetchUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount) {
      this.currentPage = page;
      this.fetchUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCount) {
      this.currentPage++;
      this.fetchUsers();
    }
  }

  onAddUser(): void {
    this.isAddModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.user = undefined;
    this.cdr.markForCheck();
  }

  viewUser(id: number): void {
    this.adminService.getUserById(id).subscribe({
      next: (response: any) => {
        this.user = response.data;
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.show('Failed to load user card details', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  editUser(id: number): void {
    this.adminService.getUserById(id).subscribe({
      next: (response: any) => {
        this.user = response.data;
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.show('Failed to load user card details', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  protected roleName(roles: any[]): string {
    if (!roles || !Array.isArray(roles)) {
      return '';
    }
    return roles.map((role) => role.roleName).join(', ');
  }

  search() {
    if (this.isSearch) {
      return;
    }
    this.isSearch = true;
  }

  setActiveInactive(status: boolean) {
    if (status) {
      return 'Active';
    }
    return 'Inactive';
  }
}

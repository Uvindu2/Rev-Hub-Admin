import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { UserTableViewResponseDTO } from '../../../dto/response/UserTableViewResponseDTO';
import { UserIdNameResponseDto } from '../../../dto/response/UserIdNameResponseDto';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-user-view',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    Dropdown
  ],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
})
export class UserView implements OnInit {

  users: UserTableViewResponseDTO[] = [];

  userIdNameDtos: UserIdNameResponseDto[] = [];
  userRoleNameAndIds: string[] = [];

  filterForm!: FormGroup;

  currentPage = 1;
  pageSize = 5;
  totalElements = 0;
  totalPagesCount = 0;
  pageSizes = [5, 10, 20, 50];

  isLoading = false;
  isSearch = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.fetchUserNames();
    this.fetchUserRoles();
    this.fetchUsers();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      userId: [''],
      activeStatus: [''],
      roleId: [''],
    });
  }

  private fetchUserNames(): void {
    this.adminService.getAllUserNames().subscribe({
      next: (response: any) => {
        const userIdNameDtos = response?.data || response;

        this.userIdNameDtos = Array.isArray(userIdNameDtos)
          ? userIdNameDtos
          : [];

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
        const userRoles = response?.data || response;

        this.userRoleNameAndIds = Array.isArray(userRoles)
          ? userRoles
          : [];

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load user roles:', err);
        this.userRoleNameAndIds = [];
        this.cdr.markForCheck();
      },
    });
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const backendPage = this.currentPage - 1;
    const formValues = this.filterForm.value;

    this.adminService
      .searchUsers(
        formValues,
        backendPage,
        this.pageSize,
        'userId',
        'desc'
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {

          const pageData = response?.data || response;

          let updatedUsers: UserTableViewResponseDTO[] = [];
          let updatedTotalElements = 0;
          let updatedTotalPagesCount = 0;

          if (pageData?.content !== undefined) {

            updatedUsers = pageData.content || [];

            if (pageData.page) {

              updatedTotalElements =
                pageData.page.totalElements ??
                pageData.page.total_elements ??
                0;

              updatedTotalPagesCount =
                pageData.page.totalPages ??
                pageData.page.total_pages ??
                0;

            } else {

              updatedTotalElements =
                pageData.totalElements ??
                pageData.total_elements ??
                0;

              updatedTotalPagesCount =
                pageData.totalPages ??
                pageData.total_pages ??
                0;
            }

          } else if (Array.isArray(pageData)) {

            updatedUsers = pageData;
            updatedTotalElements = pageData.length;

            updatedTotalPagesCount =
              Math.ceil(pageData.length / this.pageSize) || 1;
          }

          this.users = updatedUsers;
          this.totalElements = updatedTotalElements;
          this.totalPagesCount = updatedTotalPagesCount;

          this.cdr.markForCheck();
        },

        error: (err: any) => {
          console.error('Failed to load users from server:', err);

          this.users = [];
          this.totalElements = 0;
          this.totalPagesCount = 0;

          this.cdr.markForCheck();
        },
      });
  }

  onApplyFilters(): void {
    this.currentPage = 1;
    this.fetchUsers();
  }

  onResetFilters(): void {

    this.filterForm.reset({
      userId: '',
      activeStatus: '',
      roleId: '',
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

  // ADD NEW
  onAddUser(): void {
    this.router.navigate(['/dashboard/users/new']);
  }

  // VIEW PAGE
  viewUser(id: number): void {
    this.router.navigate(['/dashboard/users/view', id]);
  }

  // EDIT PAGE
  editUser(id: number): void {
    this.router.navigate(['/dashboard/users/edit', id]);
  }

  protected roleName(roles: any[]): string {

    if (!roles || !Array.isArray(roles)) {
      return '';
    }

    return roles
      .map(role => role.roleName)
      .join(', ');
  }

  setActiveInactive(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  search(): void {

    if (this.isSearch) {
      return;
    }

    this.isSearch = true;
  }
}

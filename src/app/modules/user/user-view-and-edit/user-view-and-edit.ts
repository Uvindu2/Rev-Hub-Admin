
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { RoleNameResponseDTO } from '../../../dto/response/RoleNameResponseDTO';
import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-user-view-and-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MultiSelectDropdown
  ],
  templateUrl: './user-view-and-edit.html',
  styleUrl: './user-view-and-edit.css'
})
export class UserViewAndEdit implements OnInit {

  // Initial page loading
  isLoadingPage = true;

  private initialLoadsRemaining = 2;

  userForm!: FormGroup;

  rolesList: RoleNameResponseDTO[] = [];

  userId!: number;

  isEditMode = false;
  isViewMode = false;

  // Update button loading
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoadingPage = true;
    this.initialLoadsRemaining = 2;

    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    const currentUrl = this.router.url;

    this.isEditMode = currentUrl.includes('/edit/');
    this.isViewMode = currentUrl.includes('/view/');

    // Validate user ID before making API requests
    if (!Number.isInteger(this.userId) || this.userId <= 0) {
      this.isLoadingPage = false;

      this.notificationService.show(
        'Invalid user ID.',
        'error'
      );

      this.router.navigate(['/dashboard/users']);
      return;
    }

    this.initForm();

    // Load both resources in parallel
    this.loadRoles();
    this.loadUser();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      fullName: ['', Validators.required],
      speciality: [''],
      userRoleSelected: [[], Validators.required],
      active: [true, Validators.required]
    });
  }

  /**
   * Called when either initial API request finishes.
   * The page loader disappears after BOTH requests finish.
   */
  private finishInitialLoad(): void {
    this.initialLoadsRemaining--;

    if (this.initialLoadsRemaining <= 0) {
      this.isLoadingPage = false;
    }

    this.cdr.markForCheck();
  }

  private loadRoles(): void {
    this.adminService
      .getRoles()
      .pipe(
        finalize(() => this.finishInitialLoad())
      )
      .subscribe({
        next: (response: any) => {
          const data = response?.data ?? response;

          this.rolesList = Array.isArray(data) ? data : [];

          this.cdr.markForCheck();
        },

        error: (err: any) => {
          console.error('Failed to load roles:', err);

          this.rolesList = [];

          this.notificationService.show('Failed to load user roles.', 'error');
        }
      });
  }

  private loadUser(): void {
    this.adminService
      .getUserById(this.userId)
      .pipe(
        finalize(() => this.finishInitialLoad())
      )
      .subscribe({
        next: (response: any) => {
          const user = response?.data ?? response;

          this.userForm.patchValue({
            username: user.username || '',
            fullName: user.fullName || '',
            speciality: user.speciality || '',
            active: user.active ?? true,

            userRoleSelected: Array.isArray(user.role) ? user.role.map((role: any) => role.roleId) : []
          });

          // Do not load or populate a password from the backend.
          if (this.isViewMode) {
            this.userForm.disable();
          }

          this.cdr.markForCheck();
        },

        error: (err: any) => {
          console.error('Failed to load user:', err);

          this.notificationService.show('Failed to load user details.', 'error');

          this.router.navigate(['/dashboard/users']);
        }
      });
  }

  onSubmit(): void {
    if (this.isSubmitting || this.isViewMode) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();

      this.notificationService.show('Please fill out all required fields correctly.', 'error');

      return;
    }

    this.isSubmitting = true;

    const formValue = this.userForm.getRawValue();

    const backendPayload: any = {
      userId: this.userId,
      fullName: formValue.fullName,
      speciality: formValue.speciality,
      roleIds: formValue.userRoleSelected || [],
      active: formValue.active
    };

    // Send the password only if the user entered one.
    if (formValue.password?.trim()) {
      backendPayload.password = formValue.password;
    }

    this.adminService
      .modifyUser(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.show(
            'User updated successfully!', 'success');

          this.router.navigate(['/dashboard/users']);
        },

        error: (err: any) => {
          console.error('Error updating user:', err);

          const message = err?.error?.data || 'Failed to update user.';

          this.notificationService.show('Error: ' + message, 'error');
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/users']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);

    return !!(
      control && control.invalid && (control.dirty || control.touched));
  }

  get userRoleSelectedControl(): FormControl {
    return this.userForm.get('userRoleSelected') as FormControl;
  }
}

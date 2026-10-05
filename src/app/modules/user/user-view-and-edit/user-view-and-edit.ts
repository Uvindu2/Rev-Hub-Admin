import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { RoleNameResponseDTO } from '../../../dto/response/RoleNameResponseDTO';
import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';

@Component({
  selector: 'app-user-view-and-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MultiSelectDropdown
  ],
  templateUrl: './user-view-and-edit.html',
  styleUrl: './user-view-and-edit.css',
})
export class UserViewAndEdit implements OnInit {

  userForm!: FormGroup;

  rolesList: RoleNameResponseDTO[] = [];

  userId!: number;

  isEditMode = false;
  isViewMode = false;
  isLoading = false;
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

    this.userId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const currentUrl = this.router.url;

    this.isEditMode = currentUrl.includes('/edit/');
    this.isViewMode = currentUrl.includes('/view/');

    this.initForm();
    this.loadRoles();
    this.loadUser();
  }

  private initForm(): void {

    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/)
        ]
      ],

      password: [''],

      fullName: [
        '',
        Validators.required
      ],

      speciality: [''],

      userRoleSelected: [
        [],
        Validators.required
      ],

      active: [
        true,
        Validators.required
      ]
    });
  }

  private loadRoles(): void {

    this.adminService.getRoles().subscribe({
      next: (response: any) => {

        this.rolesList = response?.data || response;

        this.cdr.markForCheck();
      },

      error: (err: any) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  private loadUser(): void {

    if (!this.userId) {
      this.notificationService.show(
        'Invalid user ID.',
        'error'
      );

      this.router.navigate(['/dashboard/users']);

      return;
    }

    this.isLoading = true;

    this.adminService
      .getUserById(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: (response: any) => {

          const user = response?.data || response;

          this.userForm.patchValue({
            username: user.username || '',
            fullName: user.fullName || '',
            speciality: user.speciality || '',
            active: user.active ?? true,
            userRoleSelected: user.role?.map(
              (role: any) => role.roleId
            ) || []
          });

          /*
           * Password is not loaded from backend.
           * Password remains empty when editing.
           */

          if (this.isViewMode) {
            this.userForm.disable();
          }

          this.cdr.markForCheck();
        },

        error: (err: any) => {

          console.error(
            'Failed to load user:',
            err
          );

          this.notificationService.show(
            'Failed to load user details.',
            'error'
          );

          this.router.navigate([
            '/dashboard/users'
          ]);
        }
      });
  }

  onSubmit(): void {

    if (this.isSubmitting) {
      return;
    }

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      this.notificationService.show(
        'Please fill out all required fields correctly.',
        'error'
      );

      return;
    }

    this.isSubmitting = true;

    const formValue = this.userForm.getRawValue();

    const backendPayload: any = {
      userId: this.userId,
      username: formValue.username,
      fullName: formValue.fullName,
      speciality: formValue.speciality,
      roleIds: formValue.userRoleSelected || [],
      active: formValue.active
    };

    /*
     * Only send password when user entered one.
     */
    if (formValue.password) {
      backendPayload.password = formValue.password;
    }

    this.adminService
      .modifyUser(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({

        next: () => {

          this.notificationService.show(
            'User updated successfully!',
            'success'
          );

          this.router.navigate([
            '/dashboard/users'
          ]);
        },

        error: (err: any) => {

          console.error(
            'Error updating user:',
            err
          );

          const message =
            err?.error?.data ||
            'Failed to update user.';

          this.notificationService.show(
            'Error: ' + message,
            'error'
          );
        }
      });
  }

  onBack(): void {
    this.router.navigate([
      '/dashboard/users'
    ]);
  }

  isInvalid(controlName: string): boolean {

    const control = this.userForm.get(
      controlName
    );

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  get userRoleSelectedControl(): FormControl {
    return this.userForm.get(
      'userRoleSelected'
    ) as FormControl;
  }
}

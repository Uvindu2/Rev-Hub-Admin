import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';
import { RoleNameResponseDTO } from '../../../dto/response/RoleNameResponseDTO';
import { MultiSelectDropdown } from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MultiSelectDropdown
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  standalone: true
})
export class UserForm implements OnInit {

  userForm!: FormGroup;
  rolesList: RoleNameResponseDTO[] = [];
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  initForm(): void {
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
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]
      ],
      fullName: ['', Validators.required],
      speciality: [''],
      userRoleSelected: [[], Validators.required],
      active: [true, Validators.required]
    });
  }

  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        this.rolesList = res.data || res;
      },
      error: (err: any) => {
        console.error('Failed to load roles', err);
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

    const formValue = this.userForm.value;

    const backendPayload = {
      username: formValue.username,
      password: formValue.password,
      fullName: formValue.fullName,
      speciality: formValue.speciality,
      roleIds: formValue.userRoleSelected || [],
      active: formValue.active
    };

    this.adminService
      .saveUser(backendPayload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.show(
            'User saved successfully!',
            'success'
          );

          this.router.navigate(['/dashboard/users']);
        },

        error: (err) => {
          console.error('Error saving User:', err);

          const serverErrorMessage =
            err.error?.data || 'Failed to save User.';

          this.notificationService.show(
            'Error: ' + serverErrorMessage,
            'error'
          );
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/users']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  get userRoleSelectedControl(): FormControl {
    return (
      (this.userForm?.get('userRoleSelected') as FormControl) ||
      new FormControl([])
    );
  }
}

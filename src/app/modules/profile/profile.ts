import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notificationService';

interface ProfileUser {
  userId: number;
  username: string;
  fullName: string | null;
  speciality: string | null;
  active: boolean;
  role: Array<{ roleId: number; roleName?: string }>;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  private user?: ProfileUser;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      fullName: ['', Validators.required],
      speciality: [''],
      role: [{ value: '', disabled: true }]
    });

    const currentUser = this.authService.getCurrentUser();
    const userId = Number(currentUser?.userId ?? currentUser?.id ?? currentUser?.data?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      this.isLoading = false;
      this.notificationService.show('Your account details are unavailable. Please sign in again.', 'error');
      return;
    }

    this.adminService.getUserById(userId).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response: any) => {
        this.user = response?.data ?? response;
        this.profileForm.patchValue({
          username: this.user?.username ?? currentUser?.username ?? '',
          fullName: this.user?.fullName ?? '',
          speciality: this.user?.speciality ?? '',
          role: this.user?.role?.map(role => role.roleName).filter(Boolean).join(', ') ?? ''
        });
      },
      error: (error: any) => {
        console.error('Failed to load profile:', error);
        this.notificationService.show('Failed to load your profile details.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.user) return;
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.notificationService.show('Please enter your full name.', 'error');
      return;
    }

    this.isSubmitting = true;
    const values = this.profileForm.getRawValue();
    this.adminService.modifyUser({
      userId: this.user.userId,
      fullName: values.fullName,
      speciality: values.speciality,
      roleIds: (this.user.role ?? []).map(role => role.roleId),
      active: this.user.active
    }).pipe(finalize(() => {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.notificationService.show('Profile updated successfully.', 'success');
        this.router.navigate(['/dashboard/overview']);
      },
      error: (error: any) => {
        console.error('Failed to update profile:', error);
        this.notificationService.show(error?.error?.data || 'Failed to update your profile.', 'error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/overview']);
  }
}

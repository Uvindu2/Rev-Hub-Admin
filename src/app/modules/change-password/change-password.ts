import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {AdminService} from '../../services/admin.service';
import {NotificationService} from '../../services/notificationService';
import {finalize} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword implements OnInit {

  @Output() cancel = new EventEmitter();

  changePwdForm!: FormGroup;
  isSubmitting = false;

  showCurrentPassword = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUsername = this.authService.getCurrentUsername();
    this.initForm(currentUsername);
  }

  initForm(username: string): void {
    this.changePwdForm = this.fb.group({
      username: [{ value: username, disabled: true }, [Validators.required]],
      currentPwd: ['', [Validators.required, Validators.minLength(6)]],
      newPwd: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@\(!%*?&])[A-Za-z\d@\)!%*?&]{8,}$/)
        ]
      ],
      confirmPwd: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPwd = form.get('newPwd')?.value;
    const confirmPwd = form.get('confirmPwd')?.value;
    if (newPwd !== confirmPwd) {
      form.get('confirmPwd')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const confirmErrors = form.get('confirmPwd')?.errors;
      if (confirmErrors) {
        delete confirmErrors['mismatch'];
        if (Object.keys(confirmErrors).length === 0) {
          form.get('confirmPwd')?.setErrors(null);
        }
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.changePwdForm.invalid) {
      this.changePwdForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields according to security standards.', 'error');
      return;
    }

    this.isSubmitting = true;

    // CRITICAL: Use getRawValue() because disabled controls are stripped out in standard .value
    const formValue = this.changePwdForm.getRawValue();

    const backendPayload = {
      username: formValue.username.trim(),
      currentPassword: formValue.currentPwd,
      newPassword: formValue.newPwd
    };

    this.adminService.changePassword(backendPayload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })).subscribe({
      next: () => {
        this.notificationService.show('Password changed successfully!', 'success');
        this.router.navigate(['/dashboard/overview']);
      },
      error: (err: any) => {
        console.error('Error changing password:', err);
        const errorMsg = err.error?.message || 'Failed to change password.';
        this.notificationService.show(errorMsg, 'error');
      }
    });
  }

  onCancel(): void {
    // Emits to parent dashboard to close the modal overlay instead of hardcoding routes
    this.router.navigate(['/dashboard/overview']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.changePwdForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

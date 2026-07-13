import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notificationService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Added CommonModule for structural directives
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup; // Defined the form tracking group
  statusError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    // Initialize your reactive form controls
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.statusError = 'Please fill out all dashboard access credentials.';
      return;
    }

    // FIX: Pull directly from reactive form control values instead of blank credentials object
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['dashboard/overview']);
      },
      error: (err) => {
        this.statusError = err.error?.message || 'Connection refused by server engine.';
        this.notificationService.show(this.statusError, 'error');
      },
    });
  }
}

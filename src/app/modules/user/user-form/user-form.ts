import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {RoleNameResponseDTO} from '../../../dto/response/RoleNameResponseDTO';
import {finalize} from 'rxjs';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';

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

  @Output() cancel = new EventEmitter<void>();

  userForm!: FormGroup;
  rolesList: RoleNameResponseDTO[] = [];

  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/) // Allows only letters, numbers, underscores, dots, and hyphens
        ]
      ],
      password: ['',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
          // Requires: at least 1 lowercase, 1 uppercase, 1 number, and 1 special character
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
        // Assuming your standard response nests the list in 'data' or returns it directly
        this.rolesList = res.data || res;
      },
      error: (err: any) => console.error('Failed to load roles', err)
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }
    this.isSubmitting = true;
    const formValue = this.userForm.value;

    // Payload matches UserSaveRequestDTO expected by Spring Boot backend
    const backendPayload = {
      username: formValue.username,
      password: formValue.password,
      fullName: formValue.fullName,
      speciality: formValue.speciality,
      roleIds: formValue.userRoleSelected || [],
      active: formValue.active,
    };

    this.adminService.saveUser(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('User saved successfully!', 'success');
        this.cancel.emit();
      },
      error: (err) => {
        console.error('Error saving User:', err);
        const serverErrorMessage =
          err.error?.data || 'Failed to save User.';
        this.notificationService.show('Error: ' + serverErrorMessage, 'error');

      },
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get userRoleSelectedControl(): FormControl {
    return (this.userForm?.get('userRoleSelected') as FormControl) || new FormControl([]);
  }
}

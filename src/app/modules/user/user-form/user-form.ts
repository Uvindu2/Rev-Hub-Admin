import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {RoleNameDTO} from '../../../dto/response/RoleNameDTO';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MultiSelectDropdown
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {

  @Output() cancel = new EventEmitter<void>();

  userForm!: FormGroup;
  rolesList: RoleNameDTO[] = [];

  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
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
      error: (err: any) => {
        console.error('Error saving User:', err);
        const errorMsg = err.error?.message || 'Failed to save User.';
        this.notificationService.show(errorMsg, 'error');
      }
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

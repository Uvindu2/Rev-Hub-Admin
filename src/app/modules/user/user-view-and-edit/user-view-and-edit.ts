import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserResponseDTO} from '../../../dto/response/UserResponseDTO';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {NgIf} from '@angular/common';
import {RoleNameDTO} from '../../../dto/response/RoleNameDTO';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../services/notificationService';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-user-view-and-edit',
  imports: [
    FormsModule,
    MultiSelectDropdown,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './user-view-and-edit.html',
  styleUrl: './user-view-and-edit.css',
  standalone: true
})
export class UserViewAndEdit implements OnInit, AfterViewInit{
  @Input() user!: UserResponseDTO | undefined;
  @Input() isViewModalOpen!: boolean;
  @Input() isEditModalOpen!: boolean;
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

  ngAfterViewInit(): void {
    // If data already exists, patch it after the view is ready
    if (this.user) {
      this.patchFormWithData(this.user);
    }
    }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
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
      userId: this.user?.userId,
      fullName: formValue?.fullName,
      roleIds: formValue?.userRoleSelected || [],
      active: formValue?.active,
    };

    this.adminService.modifyUser(backendPayload).pipe(
      // Always reset submit loader
      // success OR error
      finalize(() => {
        this.isSubmitting = false;
      })).subscribe({
      next: (res: any) => {
        this.notificationService.show('User modified successfully!', 'success');
        this.cancel.emit();
      },
      error: (err: any) => {
        console.error('Error modifying User:', err);
        const errorMsg = err.error?.message || 'Failed to modify User.';
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

  private patchFormWithData(data: UserResponseDTO) {
    // Use patchValue with a complete object map
    this.userForm.patchValue({
      username: data.username,
      fullName: data.fullName,
      userRoleSelected: data.role?.map((r: { roleId: any; }) => r.roleId) || [],
      active: data.active,
    }, {emitEvent: false});

    this.cdr.markForCheck();
  }
}

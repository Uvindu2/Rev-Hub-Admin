import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {UserTableViewResponseDTO} from '../../../dto/response/UserTableViewResponseDTO';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MultiSelectDropdown} from '../../../shared/components/multi-select-dropdown/multi-select-dropdown';
import {NgIf} from '@angular/common';
import {RoleNameResponseDTO} from '../../../dto/response/RoleNameResponseDTO';
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
export class UserViewAndEdit implements OnInit, AfterViewInit, OnChanges {

  @Input() user!: UserTableViewResponseDTO | undefined;
  @Input() isViewModalOpen!: boolean;
  @Input() isEditModalOpen!: boolean;
  @Output() cancel = new EventEmitter<void>();

  userForm!: FormGroup;
  rolesList: RoleNameResponseDTO[] = [];
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditModalOpen'] && this.userForm) {
      this.updateFormMode();
    }

    if (changes['user'] && this.user && this.userForm) {
      this.patchFormWithData(this.user);
    }
  }

  ngAfterViewInit(): void {
    if (this.user) {
      this.patchFormWithData(this.user);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      speciality: [''],
      userRoleSelected: [[], Validators.required],
      active: [true, Validators.required]
    });

    this.updateFormMode();
  }

  private updateFormMode(): void {
    if (!this.userForm) {
      return;
    }

    if (this.isEditModalOpen) {
      this.userForm.enable();
      this.userForm.get('username')?.disable();
    } else {
      this.userForm.disable();
    }

    this.cdr.markForCheck();
  }

  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        this.rolesList = res.data || res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load roles', err)
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isEditModalOpen) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notificationService.show('Please fill out all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.userForm.getRawValue();

    const backendPayload = {
      userId: this.user?.userId,
      fullName: formValue.fullName,
      speciality: formValue.speciality,
      roleIds: formValue.userRoleSelected || [],
      active: formValue.active,
    };

    this.adminService.modifyUser(backendPayload).pipe(
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
    return this.userForm?.get('userRoleSelected') as FormControl;
  }

  private patchFormWithData(data: UserTableViewResponseDTO): void {
    this.userForm.patchValue({
      username: data.username,
      fullName: data.fullName,
      speciality: data.speciality,
      userRoleSelected: data.role?.map((r: { roleId: any }) => r.roleId) || [],
      active: data.active,
    }, {emitEvent: false});

    this.updateFormMode();
    this.cdr.markForCheck();
  }
}

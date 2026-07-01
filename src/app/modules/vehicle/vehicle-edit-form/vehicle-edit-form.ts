import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AddCustomerForm} from '../../customer/add-customer-form/add-customer-form';

export interface Customer {
  licenseNumber?: string;
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
}

export interface Vehicle {
  regNo: string;
  make: string;
  model: string;
  year: number;
  color: string;
  colorHex: string;
  mileage: number;
  status: 'In Service' | 'Awaiting Info' | 'Ready';
  customers: Customer[];
}

@Component({
  selector: 'app-vehicle-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCustomerForm],
  templateUrl: './vehicle-edit-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-edit-form.css'
})
export class VehicleEditFormComponent implements OnInit {

  @Input() vehicle!: Vehicle;

  @Output() save = new EventEmitter<Vehicle>();
  @Output() cancel = new EventEmitter<void>();

  editableVehicle!: Vehicle;

  // 🌟 popup control
  showCustomerPopup = false;

  ngOnInit(): void {

    if (this.vehicle) {
      this.editableVehicle = {
        ...this.vehicle,
        customers: this.vehicle.customers
          ? this.vehicle.customers.map(c => ({ ...c }))
          : []
      };
    }
  }

  // ----------------------------
  // Vehicle actions
  // ----------------------------

  submitForm(): void {
    this.save.emit(this.editableVehicle);
  }

  closeForm(): void {
    this.cancel.emit();
  }

  // ----------------------------
  // Customer popup control
  // ----------------------------

  openCustomerPopup(): void {
    this.showCustomerPopup = true;
  }

  closeCustomerPopup(): void {
    this.showCustomerPopup = false;
  }

  // ----------------------------
  // Receive saved customer from popup
  // ----------------------------

  onCustomerSaved(customer: Customer): void {

    if (!this.editableVehicle.customers) {
      this.editableVehicle.customers = [];
    }

    // add customer to vehicle
    this.editableVehicle.customers.push(customer);

    // close popup and stay in edit component
    this.showCustomerPopup = false;
  }
  // ----------------------------
  // Remove customer from list
  // ----------------------------

  removeCustomer(index: number): void {
    this.editableVehicle.customers?.splice(index, 1);
  }
}

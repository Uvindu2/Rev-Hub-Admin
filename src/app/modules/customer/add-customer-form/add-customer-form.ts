import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-customer-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-customer-form.html',
  styleUrl: './add-customer-form.css'
})
export class AddCustomerForm {

  @Output() close = new EventEmitter<void>();
  @Output() customerSaved = new EventEmitter<any>();

  licenseNumber = '';

  customer = {
    licenseNumber: '',
    name: '',
    contactNumber: '',
    email: '',
    address: ''
  };

  closePopup(): void {
    this.close.emit();
  }

  searchCustomer(): void {

    // TODO: Call backend API

    this.customer = {
      licenseNumber: this.licenseNumber,
      name: 'Raman Gamini',
      contactNumber: '0771234567',
      email: 'raman@gmail.com',
      address: 'Negombo'
    };
  }

  saveCustomer(): void {
    this.customerSaved.emit(this.customer); // send data to parent
    this.close.emit(); // close popup
  }
}

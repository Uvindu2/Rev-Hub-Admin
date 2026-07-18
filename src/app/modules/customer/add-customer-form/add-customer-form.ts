import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-add-customer-form',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './add-customer-form.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrl: './add-customer-form.css'
})
export class AddCustomerForm {

	@Output() close = new EventEmitter<void>();
	@Output() customerSaved = new EventEmitter<any>();

	licenseNumber = '';

	customer = {
    customerId: null,
    drivingLicenseNumber: '',
    customerName: '',
    contactNumber: '',
    active: true,
    email: '',
    customerAddress: ''
	};

	closePopup(): void {
		this.close.emit();
	}

	searchCustomer(): void {

		// TODO: Call backend API

		this.customer = {
      customerId: null,
      drivingLicenseNumber: this.licenseNumber,
      customerName: 'Raman Gamini',
			contactNumber: '0771234567',
			email: 'raman@gmail.com',
      customerAddress: 'Negombo',
      active: true
		};
	}

	saveCustomer(): void {
		this.customerSaved.emit(this.customer); // send data to parent
		this.close.emit(); // close popup
	}
}

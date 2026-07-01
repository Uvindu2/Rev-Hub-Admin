export interface Customer {
  customerId: number;
  customerName: string;
  customerAddress: string;
  contactNumbers: string; // JSON string or single value
  drivingLicenseNumber: string;
  email: string;
  active: boolean;
}

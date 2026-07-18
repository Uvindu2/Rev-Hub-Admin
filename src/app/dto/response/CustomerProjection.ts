// The individual record structure matching your Java interface
export interface CustomerProjection {
  customerId: number;
  customerName: string;
  contactNumber: string;
  email: string;
  drivingLicenseNumber: string;
  active: boolean;
  customerAddress: string;
}

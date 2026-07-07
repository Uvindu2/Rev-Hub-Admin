interface JobCardProjection {
  jobId: number;
  dateAdded: string;
  estimatedCompletionTime: string;
  status: string;
  customerComplaintText: string;
  vehicle: {
    vehicleId: number;
    vehicleRegNo: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    colour?: string;
    otherSpecs?: string;
    customer: {
      customerId: number;
      customerName: string;
      customerAddress?: string;
      email?: string;
      contactNumber?: string;
      drivingLicenseNumber?: string;
      isActive?: boolean;
    };
  };
  technician: Array<{
    technicianId: number;
    technicianName: string;
  }>;
  laborActivities: Array<{
    laborActivityId: number;
    activityName: string;
  }>;
}

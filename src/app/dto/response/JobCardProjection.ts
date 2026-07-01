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
    customer: {
      customerId: number;
      customerName: string;
    }
  };
  technician: Array<{
    technicianId: number;
    technicianName: string;
  }>;
}

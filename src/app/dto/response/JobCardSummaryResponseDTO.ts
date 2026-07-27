export interface JobCardSummaryResponseDTO {
  jobId: number;
  jobCardNumber: string;
  customerName: string;
  vehicleRegNumber: string;
  createdDate: string; // or Date if you parse it on the frontend
  status: string;
  technicianName: string;
}

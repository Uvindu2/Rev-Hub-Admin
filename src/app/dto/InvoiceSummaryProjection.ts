// The individual record
export interface InvoiceSummaryProjection {
  customerName: string;
  jobId: number;
  jobCardNumber: string;
  invoiceNumber: string;
  invoiceId: number;
  createdUser: string;
  createdDate: string;
  grandTotal: number;
  status: string;
}

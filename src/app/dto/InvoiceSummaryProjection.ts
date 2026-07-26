// The individual record
export interface InvoiceSummaryProjection {
  customerName: string;
  jobId: number;
  jobCardNumber: string;
  invoiceNumber: string;
  invoiceId: number;
  invoiceDate: string;
  grandTotal: number;
  status: string;
}

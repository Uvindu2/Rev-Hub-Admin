// The individual record
export interface InvoiceSummaryProjection {
  customerName: string;
  jobId: number;
  invoiceId: number;
  invoiceDate: string; // ISO Date string
  grandTotal: number;
  status: string;
}

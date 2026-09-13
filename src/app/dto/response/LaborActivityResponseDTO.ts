import {InvoiceItemResponseDTO} from './InvoiceItemResponseDTO';

export interface InvoiceLaborActivityResponseDTO{
  laborActivityId: number;
  activityName: string;
  isAutoFetched:boolean;
  laborFee:number;
  parts:InvoiceItemResponseDTO[];
}

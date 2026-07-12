export interface ItemProjection {
  itemId: number;
  itemName: string;
  dateModify: string;
  userModify: string;
  balanceQty: number;
  supplierPrice: number;
  measuringUnitType:any;
  sellingPrice: number;
  laborActivities: Array<{
    laborActivityId: number;
    activityName: string;
  }>;
}

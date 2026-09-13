import {LaborActivityNameResponseProjection} from './LaborActivityNameResponseProjection';

export interface ItemTableViewResponseProjection {
  itemId: number;
  itemName: string;
  dateModify: string;
  userModify: string;
  balanceQty: number;
  supplierPrice: number;
  measuringUnitType:any;
  sellingPrice: number;
  laborActivities: LaborActivityNameResponseProjection[];
}

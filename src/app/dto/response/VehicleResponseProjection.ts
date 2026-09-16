import {CustomerResponseProjection} from './CustomerResponseProjection';

export interface VehicleResponseProjection {
  vehicleId: number;
  vehicleRegNo: string;
  vehicleVinNo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  colour: string;
  otherSpecs: string;
  customer: CustomerResponseProjection;
}

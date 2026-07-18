import {CustomerProjection} from './CustomerProjection';

export interface VehicleProjection {
  vehicleId: number;
  vehicleRegNo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  colour: string;
  otherSpecs: string;
  customer: CustomerProjection[];
}

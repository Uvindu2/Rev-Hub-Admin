import {VehicleResponseProjection} from './VehicleResponseProjection';
import {TechnicianResponseProjection} from './TechnicianResponseProjection';
import {LaborActivityTableViewResponseProjection} from './LaborActivityTableViewResponseProjection';

export interface JobCardResponseDto {
  jobId: number;
  createdDate: string;
  estimatedCompletionTime: string;
  status: string;
  customerComplaintText: string;
  currentMileage: number;
  vehicle: VehicleResponseProjection;
  technicians: TechnicianResponseProjection[];
  laborActivities: LaborActivityTableViewResponseProjection[];
}

import {VehicleProjection} from './VehicleProjection';
import {TechnicianProjection} from './TechnicianProjection';
import {LaborActivityProjection} from './LaborActivityProjection';

export interface JobCardResponseDto {
  jobId: number;
  createdDate: string;
  estimatedCompletionTime: string;
  status: string;
  customerComplaintText: string;
  currentMileage: number;
  vehicle: VehicleProjection;
  technicians: TechnicianProjection[];
  laborActivities: LaborActivityProjection[];
}

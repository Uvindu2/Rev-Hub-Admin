export interface JobCardStatusResponseProjection {
  pendingCount: number;
  inProgressCount: number;
  rejectedCount: number;
  completedCount: number;
}

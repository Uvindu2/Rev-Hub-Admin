export interface JobCardStatusResponseProjection {
  pendingCount: number;
  inProgressCount: number;
  cancelledCount: number;
  completedCount: number;
}

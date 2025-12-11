import { activityLogs } from '../../../database/schema/activity_logs.schema';

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type CreateActivityLogDto = {
  activityType: string;
  intensity: string;
  durationMinutes: number;
  completedAt: Date | number;
};

export type UpdateActivityLogDto = {
  activityType?: string;
  intensity?: string;
  durationMinutes?: number;
  completedAt?: Date | number;
};

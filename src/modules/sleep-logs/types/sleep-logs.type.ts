import { sleepLogs } from '../../../database/schema/sleep_logs.schema';

export type SleepLog = typeof sleepLogs.$inferSelect;
export type NewSleepLog = typeof sleepLogs.$inferInsert;

export type CreateSleepLogDto = {
  startTime: Date | number;
  endTime: Date | number;
  quality: 'good' | 'average' | 'poor';
};

export type UpdateSleepLogDto = {
  startTime?: Date | number;
  endTime?: Date | number;
  quality?: 'good' | 'average' | 'poor';
};

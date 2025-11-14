import { db } from '../../database';
import { sleepLogs } from '../../database/schema/sleep_logs.schema';
import { and, eq } from 'drizzle-orm';
import { CreateSleepLogDto, UpdateSleepLogDto } from './types/sleep-logs.type';

export const createSleepLog = async (userId: string, data: CreateSleepLogDto) => {
  const [newLog] = await db
    .insert(sleepLogs)
    .values({ ...data, userId })
    .returning();
  return newLog;
};

export const getSleepLogs = async (userId: string) => {
  const logs = await db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId));
  return logs;
};

export const updateSleepLog = async (userId: string, logId: string, data: UpdateSleepLogDto) => {
  const [updatedLog] = await db
    .update(sleepLogs)
    .set(data)
    .where(and(eq(sleepLogs.id, logId), eq(sleepLogs.userId, userId)))
    .returning();
  return updatedLog;
};

export const deleteSleepLog = async (userId: string, logId: string) => {
  const [deletedLog] = await db
    .delete(sleepLogs)
    .where(and(eq(sleepLogs.id, logId), eq(sleepLogs.userId, userId)))
    .returning();
  return deletedLog;
};

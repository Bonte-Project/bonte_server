import { db } from '../../database';
import { sleepLogs } from '../../database/schema/sleep_logs.schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { CreateSleepLogDto, UpdateSleepLogDto } from './types/sleep-logs.type';

const processDate = (date: Date | string | number) => {
  if (typeof date === 'string' || typeof date === 'number') {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      throw new Error('Invalid date value');
    }
    return newDate;
  }
  if (date instanceof Date) {
    return date;
  }
  throw new Error('Invalid date format');
};

export const createSleepLog = async (userId: string, data: CreateSleepLogDto) => {
  const { startTime, endTime, ...rest } = data;

  const processedData = {
    ...rest,
    userId,
    startTime: processDate(startTime),
    endTime: processDate(endTime),
  };

  const [newLog] = await db.insert(sleepLogs).values(processedData).returning();
  return newLog;
};

export const getSleepLogs = async (userId: string) => {
  const logs = await db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId));
  return logs;
};

export const getSleepLogsByPeriod = async (userId: string, date: string | number) => {
  const targetDate = new Date(typeof date === 'string' ? date : +date);
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 30);

  const logs = await db
    .select()
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.startTime, startDate),
        lte(sleepLogs.endTime, targetDate)
      )
    );
  return logs;
};

export const updateSleepLog = async (userId: string, logId: string, data: UpdateSleepLogDto) => {
  const { startTime, endTime, ...rest } = data;
  const processedData: Record<string, any> = { ...rest };

  if (startTime !== undefined) {
    processedData.startTime = processDate(startTime);
  }

  if (endTime !== undefined) {
    processedData.endTime = processDate(endTime);
  }

  const [updatedLog] = await db
    .update(sleepLogs)
    .set(processedData)
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

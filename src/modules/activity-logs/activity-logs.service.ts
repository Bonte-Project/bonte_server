import { db } from '../../database';
import { activityLogs } from '../../database/schema/activity_logs.schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { CreateActivityLogDto, UpdateActivityLogDto } from './types/activity-logs.type';

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

export const createActivityLog = async (userId: string, data: CreateActivityLogDto) => {
  const { completedAt, ...rest } = data;

  const processedData = {
    ...rest,
    userId,
    completedAt: processDate(completedAt),
  };

  const [newLog] = await db.insert(activityLogs).values(processedData).returning();
  return newLog;
};

export const getActivityLogs = async (userId: string) => {
  const logs = await db.select().from(activityLogs).where(eq(activityLogs.userId, userId));
  return logs;
};

export const getActivityLogsByPeriod = async (userId: string, date: string | number) => {
  const targetDate = new Date(typeof date === 'string' ? date : +date);
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 30);

  const logs = await db
    .select()
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.completedAt, startDate),
        lte(activityLogs.completedAt, targetDate)
      )
    );
  return logs;
};

export const updateActivityLog = async (
  userId: string,
  logId: string,
  data: UpdateActivityLogDto
) => {
  const { completedAt, ...rest } = data;
  const processedData: Record<string, any> = { ...rest };

  if (completedAt !== undefined) {
    processedData.completedAt = processDate(completedAt);
  }

  const [updatedLog] = await db
    .update(activityLogs)
    .set(processedData)
    .where(and(eq(activityLogs.id, logId), eq(activityLogs.userId, userId)))
    .returning();
  return updatedLog;
};

export const deleteActivityLog = async (userId: string, logId: string) => {
  const [deletedLog] = await db
    .delete(activityLogs)
    .where(and(eq(activityLogs.id, logId), eq(activityLogs.userId, userId)))
    .returning();
  return deletedLog;
};

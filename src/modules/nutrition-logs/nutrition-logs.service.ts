import { db } from '../../database';
import { nutritionLogs } from '../../database/schema/nutrition_logs.schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { CreateNutritionLogDto, UpdateNutritionLogDto } from './types/nutrition-logs.type';

export const createNutritionLog = async (userId: string, data: CreateNutritionLogDto) => {
  const { eatenAt, ...rest } = data;
  const processedData = {
    ...rest,
    userId,
    eatenAt: typeof eatenAt === 'number' ? new Date(eatenAt) : eatenAt,
  };

  const [newLog] = await db.insert(nutritionLogs).values(processedData).returning();
  return newLog;
};

export const getNutritionLogs = async (userId: string) => {
  const logs = await db.select().from(nutritionLogs).where(eq(nutritionLogs.userId, userId));
  return logs;
};

export const getNutritionLogsByPeriod = async (userId: string, date: string | number) => {
  const targetDate = new Date(typeof date === 'string' ? date : +date);
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 30);

  const logs = await db
    .select()
    .from(nutritionLogs)
    .where(
      and(
        eq(nutritionLogs.userId, userId),
        gte(nutritionLogs.eatenAt, startDate),
        lte(nutritionLogs.eatenAt, targetDate)
      )
    );
  return logs;
};

export const updateNutritionLog = async (
  userId: string,
  logId: string,
  data: UpdateNutritionLogDto
) => {
  const { eatenAt, ...rest } = data;
  const processedData: Record<string, any> = { ...rest };

  if (eatenAt !== undefined) {
    processedData.eatenAt = typeof eatenAt === 'number' ? new Date(eatenAt) : eatenAt;
  }

  const [updatedLog] = await db
    .update(nutritionLogs)
    .set(processedData)
    .where(and(eq(nutritionLogs.id, logId), eq(nutritionLogs.userId, userId)))
    .returning();
  return updatedLog;
};

export const deleteNutritionLog = async (userId: string, logId: string) => {
  const [deletedLog] = await db
    .delete(nutritionLogs)
    .where(and(eq(nutritionLogs.id, logId), eq(nutritionLogs.userId, userId)))
    .returning();
  return deletedLog;
};

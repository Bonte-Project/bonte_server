import { db } from '../../database';
import { nutritionLogs } from '../../database/schema/nutrition_logs.schema';
import { and, eq } from 'drizzle-orm';
import { CreateNutritionLogDto, UpdateNutritionLogDto } from './types/nutrition-logs.type';

export const createNutritionLog = async (userId: string, data: CreateNutritionLogDto) => {
  const [newLog] = await db
    .insert(nutritionLogs)
    .values({ ...data, userId })
    .returning();
  return newLog;
};

export const getNutritionLogs = async (userId: string) => {
  const logs = await db.select().from(nutritionLogs).where(eq(nutritionLogs.userId, userId));
  return logs;
};

export const updateNutritionLog = async (
  userId: string,
  logId: string,
  data: UpdateNutritionLogDto
) => {
  const [updatedLog] = await db
    .update(nutritionLogs)
    .set(data)
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

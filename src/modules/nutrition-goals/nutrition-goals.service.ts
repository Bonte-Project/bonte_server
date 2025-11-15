import { db } from '../../database';
import { nutritionGoals } from '../../database/schema/nutrition_goals.schema';
import { eq } from 'drizzle-orm';
import { CreateNutritionGoalDto } from './types/nutrition-goals.type';

export const upsertNutritionGoal = async (userId: string, data: CreateNutritionGoalDto) => {
  const [existingGoal] = await db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.userId, userId));

  if (existingGoal) {
    const [updatedGoal] = await db
      .update(nutritionGoals)
      .set(data)
      .where(eq(nutritionGoals.userId, userId))
      .returning();
    return updatedGoal;
  }

  const [newGoal] = await db
    .insert(nutritionGoals)
    .values({ ...data, userId })
    .returning();
  return newGoal;
};

export const getNutritionGoal = async (userId: string) => {
  const [goal] = await db.select().from(nutritionGoals).where(eq(nutritionGoals.userId, userId));
  return goal;
};

export const deleteNutritionGoal = async (userId: string) => {
  const [deletedGoal] = await db
    .delete(nutritionGoals)
    .where(eq(nutritionGoals.userId, userId))
    .returning();
  return deletedGoal;
};

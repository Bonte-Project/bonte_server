import { nutritionLogs } from '../../../database/schema/nutrition_logs.schema';

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type NewNutritionLog = typeof nutritionLogs.$inferInsert;

export type CreateNutritionLogDto = {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  weightInGrams?: number;
  eatenAt: Date;
};

export type UpdateNutritionLogDto = {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  weightInGrams?: number;
  eatenAt?: Date;
};

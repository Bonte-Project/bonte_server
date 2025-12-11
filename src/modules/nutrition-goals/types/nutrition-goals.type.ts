import { NewNutritionGoal, NutritionGoal } from '../../../database/schema/nutrition_goals.schema';

export type CreateNutritionGoalDto = Omit<
  NewNutritionGoal,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type UpdateNutritionGoalDto = Partial<CreateNutritionGoalDto>;

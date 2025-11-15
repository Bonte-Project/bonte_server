import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const nutritionLogs = pgTable('nutrition_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  calories: integer('calories').notNull(),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fat: integer('fat'),
  weightInGrams: integer('weight_in_grams'),
  eatenAt: timestamp('eaten_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

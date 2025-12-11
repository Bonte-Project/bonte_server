import { integer, pgTable, serial, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const nutritionGoals = pgTable('nutrition_goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  calories: integer('calories').notNull(),
  protein: integer('protein').notNull(),
  fat: integer('fat').notNull(),
  carbs: integer('carbs').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type NewNutritionGoal = typeof nutritionGoals.$inferInsert;

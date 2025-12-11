import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { trainers } from './trainers.schema';

export const trainerExperience = pgTable('trainer_experience', {
  id: uuid('id').primaryKey().defaultRandom(),
  trainerId: uuid('trainer_id')
    .notNull()
    .references(() => trainers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
});

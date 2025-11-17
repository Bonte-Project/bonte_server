import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(),
  intensity: text('intensity').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

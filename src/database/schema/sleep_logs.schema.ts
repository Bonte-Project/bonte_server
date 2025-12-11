import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const sleepLogs = pgTable('sleep_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  quality: integer('quality'),
});

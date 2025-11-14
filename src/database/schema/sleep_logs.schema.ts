import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const sleepLogs = pgTable('sleep_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  quality: text('quality'), // good, average, poor мб ще якісь
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

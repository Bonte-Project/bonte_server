import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { trainers } from './trainers.schema';

export const trainer_messages = pgTable('trainer_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  trainer_id: uuid('trainer_id')
    .notNull()
    .references(() => trainers.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at').notNull().defaultNow(),
  to_from: boolean('to_from').notNull(),
});

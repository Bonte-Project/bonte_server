import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const google_oauth_credentials = pgTable('google_oauth_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  google_id: text('google_id').notNull().unique(),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

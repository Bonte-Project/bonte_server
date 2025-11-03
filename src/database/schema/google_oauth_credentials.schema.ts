import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const google_oauth_credentials = pgTable('google_oauth_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  googleId: text('google_id').notNull().unique(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { pgTable, uuid, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  full_name: varchar('full_name', { length: 255 }),
  avatar_url: text('avatar_url'),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' | 'trainer' | 'admin'
  is_email_verified: boolean('is_email_verified').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

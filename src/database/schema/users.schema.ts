import { pgTable, uuid, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' | 'trainer' | 'admin'
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

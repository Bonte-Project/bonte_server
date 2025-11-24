import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { systemPrompts } from './system_prompts.schema';

export const AI_messages = pgTable('AI_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  system_prompt_id: uuid('system_prompt_id').references(() => systemPrompts.id, {
    onDelete: 'set null',
  }),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at').notNull().defaultNow(),
  to_from: boolean('to_from').notNull(),
});

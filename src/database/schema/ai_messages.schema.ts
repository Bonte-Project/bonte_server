import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { systemPrompts } from './system_prompts.schema';

export const AIMessages = pgTable('AI_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  systemPromptId: uuid('system_prompt_id').references(() => systemPrompts.id, {
    onDelete: 'set null',
  }),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  toFrom: boolean('to_from').notNull(),
});

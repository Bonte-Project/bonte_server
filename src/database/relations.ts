import { relations } from 'drizzle-orm';
import { users } from './schema/users.schema';
import { verificationCode } from './schema/verification_code.schema';

export const usersRelations = relations(users, ({ many }) => ({
  verificationCodes: many(verificationCode),
}));

export const verificationCodesRelations = relations(verificationCode, ({ one }) => ({
  user: one(users, {
    fields: [verificationCode.userId],
    references: [users.id],
  }),
}));

import { relations } from 'drizzle-orm';
import { users } from './schema/users.schema';
import { verificationCodes } from './schema/verification-codes.schema';

export const usersRelations = relations(users, ({ many }) => ({
  verificationCodes: many(verificationCodes),
}));

export const verificationCodesRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, {
    fields: [verificationCodes.userId],
    references: [users.id],
  }),
}));

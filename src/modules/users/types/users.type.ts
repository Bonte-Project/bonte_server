import { users } from '../../../database/schema/users.schema';

export type User = typeof users.$inferSelect;
export type UserWithPremium = User & { is_premium: boolean };
export type UpdateUserDto = Partial<
  Omit<User, 'id' | 'email' | 'password' | 'role' | 'isEmailVerified' | 'createdAt'>
>;

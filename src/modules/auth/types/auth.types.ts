import { InferSelectModel } from 'drizzle-orm';
import { users } from '../../../database/schema/users.schema';

export enum UserRole {
  user = 'user',
  trainer = 'trainer',
  admin = 'admin',
}

export type User = InferSelectModel<typeof users>;

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResult {
  userId: string;
}

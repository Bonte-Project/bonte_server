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

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

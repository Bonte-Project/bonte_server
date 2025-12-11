import { and, eq, gt, gte } from 'drizzle-orm';
import { db } from '../../database';
import { users } from '../../database/schema/users.schema';
import {
  RegisterInput,
  RegisterResult,
  UserRole,
  LoginInput,
  LoginResult,
  RefreshTokenInput,
  RefreshTokenResult,
} from './types/auth.types';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateVerificationCode,
  hashPassword,
  verifyToken,
} from '../../shared/utils/auth.util';
import { verificationCode } from '../../database/schema/verification_code.schema';
import { sendPasswordResetEmail, sendVerificationEmail } from '../email/email.service';
import { googleOauthCredentials } from '../../database/schema/google_oauth_credentials.schema';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async ({
  fullName,
  email,
  password,
  role,
}: RegisterInput): Promise<RegisterResult> => {
  if (!Object.values(UserRole).includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length > 0) {
    const user = existingUser[0];

    if (user.isEmailVerified) {
      throw new Error('User already exists');
    }

    await db.delete(verificationCode).where(eq(verificationCode.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  }

  const hashedPassword = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      fullName,
      email,
      password: hashedPassword,
      role,
    })
    .returning();

  const userId = user.id;

  await db.delete(verificationCode).where(eq(verificationCode.userId, userId));

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await db.insert(verificationCode).values({
    userId,
    code,
    expiresAt,
  });

  await sendVerificationEmail(email, code);

  console.log(`Code token for user ${userId}: ${code}`);

  return { userId };
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  if (!code || typeof code !== 'string' || code.length !== 4) {
    throw new Error('Invalid code format');
  }

  console.log(`Verifying code: ${code}`);

  const userResult = await db
    .select({
      id: users.id,
      isEmailVerified: users.isEmailVerified,
    })
    .from(users)
    .where(eq(users.email, email));

  if (userResult.length === 0) {
    console.log(`User not found for email: ${email}`);
    throw new Error('User not found');
  }

  const user = userResult[0];

  if (user.isEmailVerified) {
    console.log(`Email already verified for user: ${user.id}`);
    throw new Error('Email already verified');
  }

  const codeResult = await db
    .select({
      userId: verificationCode.userId,
      expiresAt: verificationCode.expiresAt,
    })
    .from(verificationCode)
    .where(
      and(
        eq(verificationCode.userId, user.id),
        eq(verificationCode.code, code),
        gt(verificationCode.expiresAt, new Date())
      )
    );

  if (codeResult.length === 0) {
    console.log(`Invalid or expired code for user: ${user.id}`);
    throw new Error('Invalid or expired verification code');
  }

  await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, user.id));

  await db.delete(verificationCode).where(eq(verificationCode.userId, user.id));

  console.log(`Email verified successfully for user: ${user.id}`);
};

export const login = async ({ email, password }: LoginInput): Promise<LoginResult> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new Error('User not found');
  if (!user.isEmailVerified) throw new Error('Please verify your email');

  const match = await comparePassword(password, user.password ?? '');
  if (!match) throw new Error('Incorrect password');

  const accessToken = generateAccessToken(user.id, email);
  const refreshToken = generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

export const refreshTokens = async ({
  refreshToken,
}: RefreshTokenInput): Promise<RefreshTokenResult> => {
  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);
  if (!decoded || typeof decoded === 'string') throw new Error('Invalid or expired refresh token');

  const { userId } = decoded as { userId: string };
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error('User not found');

  const accessToken = generateAccessToken(userId, user.email);
  const newRefreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken: newRefreshToken };
};

export const googleAuth = async ({ idToken, role }: { idToken: string; role?: string }) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID!,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token payload');

  const { sub: googleId, email, name, picture, email_verified } = payload;
  if (!email) throw new Error('Email not found in Google token');
  if (!email_verified) throw new Error('Email not verified by Google');

  const existingUsers = await db
    .select({
      id: users.id,
      isEmailVerified: users.isEmailVerified,
      role: users.role,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId: string;
  let isNewUser = false;
  let userRole: string;
  let fullName: string;
  let avatarUrl: string | null;

  const googleCred = await db
    .select({ userId: googleOauthCredentials.userId })
    .from(googleOauthCredentials)
    .where(eq(googleOauthCredentials.googleId, googleId))
    .limit(1);

  if (googleCred.length && existingUsers.length && googleCred[0].userId !== existingUsers[0].id) {
    throw new Error('This Google account is already linked to another user');
  }

  if (!existingUsers.length) {
    if (!role) {
      throw new Error('Account not found');
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        fullName: name ?? email.split('@')[0],
        avatarUrl: picture ?? null,
        role,
        isEmailVerified: true,
      })
      .returning({ id: users.id, fullName: users.fullName, avatarUrl: users.avatarUrl });

    userId = newUser.id;
    userRole = role;
    fullName = newUser.fullName ?? name ?? email.split('@')[0];
    avatarUrl = newUser.avatarUrl;
    isNewUser = true;
  } else {
    const user = existingUsers[0];
    userId = user.id;
    userRole = user.role;
    fullName = user.fullName ?? name ?? email.split('@')[0];
    avatarUrl = user.avatarUrl;

    if (role && role !== user.role) {
      throw new Error(`Account already exists with a different role: ${user.role}`);
    }

    if (picture && picture !== user.avatarUrl) {
      await db.update(users).set({ avatarUrl: picture }).where(eq(users.id, userId));
      avatarUrl = picture;
    }
  }

  await db
    .insert(googleOauthCredentials)
    .values({
      userId,
      googleId,
      accessToken: idToken.substring(0, 255),
      refreshToken: null,
    })
    .onConflictDoUpdate({
      target: googleOauthCredentials.userId,
      set: { googleId, accessToken: idToken.substring(0, 255), createdAt: new Date() },
    });

  const jwtAccessToken = generateAccessToken(userId, email);
  const jwtRefreshToken = generateRefreshToken(userId);

  return {
    accessToken: jwtAccessToken,
    refreshToken: jwtRefreshToken,
    user: { id: userId, email, fullName, role: userRole, avatarUrl },
    isNewUser,
  };
};

export const forgotPassword = async (email: string) => {
  const userResult = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, email));

  if (userResult.length === 0) {
    console.log(`No user found for email: ${email}`);
    throw new Error('User not found');
  }

  const user = userResult[0];
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.delete(verificationCode).where(eq(verificationCode.userId, user.id));
  await db.insert(verificationCode).values({
    userId: user.id,
    code,
    expiresAt,
  });

  await sendPasswordResetEmail(email, code);

  console.log(`Code sent to ${email}: ${code}`);
};

export const verifyResetCode = async (email: string, code: string) => {
  const userResult = await db.select({ id: users.id }).from(users).where(eq(users.email, email));

  if (userResult.length === 0) {
    console.log(`No user found for email: ${email}`);
    throw new Error('User not found');
  }

  const user = userResult[0];

  const codeResult = await db
    .select()
    .from(verificationCode)
    .where(
      and(
        eq(verificationCode.userId, user.id),
        eq(verificationCode.code, code),
        gte(verificationCode.expiresAt, new Date())
      )
    );

  if (codeResult.length === 0) {
    throw new Error('Invalid or expired code');
  }

  await db.delete(verificationCode).where(eq(verificationCode.id, codeResult[0].id));
};

export const resetPassword = async (email: string, newPassword: string) => {
  const userResult = await db.select({ id: users.id }).from(users).where(eq(users.email, email));

  if (userResult.length === 0) {
    console.log(`No user found for email: ${email}`);
    throw new Error('User not found');
  }

  const user = userResult[0];
  const hashedPassword = await hashPassword(newPassword);

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));
};

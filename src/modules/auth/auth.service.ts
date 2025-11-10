import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../database';
import { users } from '../../database/schema/users.schema';
import { RegisterInput, RegisterResult, UserRole } from './types/auth.types';
import { generateVerificationCode, hashPassword } from '../../shared/utils/auth.util';
import { verificationCode } from '../../database/schema/verification_code.schema';
import { sendVerificationEmail } from '../email/email.service';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { google_oauth_credentials } from '../../database/schema/google_oauth_credentials.schema';
import { refresh_tokens } from '../../database/schema/refresh_tokens.schema';

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

export const verifyEmail = async (code: string): Promise<void> => {
  if (!code || typeof code !== 'string' || code.length !== 4) {
    throw new Error('Invalid code format');
  }

  console.log(`Verifying token: ${code}`);

  const codeResult = await db
    .select({
      userId: verificationCode.userId,
      expiresAt: verificationCode.expiresAt,
    })
    .from(verificationCode)
    .where(and(eq(verificationCode.code, code), gt(verificationCode.expiresAt, new Date())))
    .limit(1);

  if (codeResult.length === 0) {
    const existingCode = await db
      .select({ userId: verificationCode.userId })
      .from(verificationCode)
      .where(eq(verificationCode.code, code))
      .limit(1);

    if (existingCode.length > 0) {
      const userId = existingCode[0].userId;

      const userResult = await db
        .select({ isEmailVerified: users.isEmailVerified })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length > 0 && userResult[0].isEmailVerified) {
        console.log(`User already verified for code: ${code}`);
        return;
      }
    }

    console.log(`Code not found or expired: ${code}`);
    throw new Error('Invalid or expired code');
  }

  const userId = codeResult[0].userId;

  await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId));
  await db.delete(verificationCode).where(eq(verificationCode.userId, userId));

  console.log(`Email verified for user ${userId}`);
};

export const googleAuth = async ({ code, role }: { code: string; role: string }) => {
  const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: 'authorization_code',
  });

  const { access_token, refresh_token, expires_in } = tokenRes.data;

  const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { id: googleId, email, name, picture } = profileRes.data;

  const existingUsers = await db
    .select({ id: users.id, isEmailVerified: users.isEmailVerified, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId: string;
  let isNewUser = false;

  const googleCred = await db
    .select({ userId: google_oauth_credentials.userId })
    .from(google_oauth_credentials)
    .where(eq(google_oauth_credentials.googleId, googleId))
    .limit(1);

  if (googleCred.length && googleCred[0].userId !== existingUsers[0]?.id) {
    throw new Error('This Google account is already linked to another user');
  }

  if (!existingUsers.length) {
    if (!role) {
      throw new Error('Role is required for new user registration');
    }
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        fullName: name ?? email.split('@')[0],
        avatarUrl: picture,
        role,
        isEmailVerified: true,
      })
      .returning({ id: users.id });
    userId = newUser.id;
    isNewUser = true;
  } else {
    const user = existingUsers[0];
    userId = user.id;
    if (role && user.role !== role) {
      throw new Error(`Account already exists with a different role: ${user.role}`);
    }
    if (!user.isEmailVerified) {
      await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId));
    }
  }

  const tokenExpiry = new Date(Date.now() + expires_in * 1000);

  await db
    .insert(google_oauth_credentials)
    .values({
      userId,
      googleId,
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
    })
    .onConflictDoUpdate({
      target: google_oauth_credentials.userId,
      set: {
        googleId,
        accessToken: access_token,
        refreshToken: refresh_token ?? null,
        createdAt: tokenExpiry,
      },
    });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(refresh_tokens).values({
    userId,
    token: refresh_token,
    expiresAt,
  });

  const jwtAccessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  });
  const jwtRefreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    {
      expiresIn: '30d',
    }
  );

  return {
    accessToken: jwtAccessToken,
    refreshToken: jwtRefreshToken,
    user: {
      id: userId,
      email,
      fullName: name ?? email.split('@')[0],
      role,
      avatarUrl: picture,
    },
    googleUser: {
      id: googleId,
      email,
      name,
      picture,
    },
    isNewUser,
  };
};

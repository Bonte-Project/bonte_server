import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../database';
import { users } from '../../database/schema/users.schema';
import { RegisterInput, RegisterResult, UserRole } from './types/auth.types';
import { generateVerificationCode, hashPassword } from '../../shared/utils/auth.util';
import { verificationCode } from '../../database/schema/verification_code.schema';
import { sendVerificationEmail } from '../email/email.service';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    throw new Error('User already exists');
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

export const googleRegister = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Invalid Google token or missing email');
  }
  const email = payload.email;
  const fullName = payload.name || 'Google User';

  let user = (await db.select().from(users).where(eq(users.email, email))).at(0);
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email,
        password: '',
        role: 'user',
        isEmailVerified: true,
      })
      .returning();
    user = newUser;
  }

  const jwtToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  return {
    message: 'Google registration successful',
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

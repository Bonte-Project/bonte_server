import { db } from '../../database';
import { users } from '../../database/schema/users.schema';
import { subscriptions } from '../../database/schema/subscriptions.schema';
import { eq } from 'drizzle-orm';
import { UpdateUserDto } from './types/users.type';

export const getMe = async (userId: string) => {
  const userWithSubscription = await db
    .select()
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId));

  const user = userWithSubscription[0]?.users;
  const subscription = userWithSubscription[0]?.subscriptions;

  if (!user) {
    return null;
  }

  const isPremium = subscription?.status === 'active' && subscription?.endDate > new Date();

  return { ...user, isPremium };
};

export const updateMe = async (userId: string, data: UpdateUserDto) => {
  const updatedUser = await db.update(users).set(data).where(eq(users.id, userId)).returning();
  return updatedUser[0];
};

export const getUserById = async (userId: string) => {
  const userWithSubscription = await db
    .select()
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId));

  const user = userWithSubscription[0]?.users;
  const subscription = userWithSubscription[0]?.subscriptions;

  if (!user) {
    return null;
  }

  const isPremium = subscription?.status === 'active' && subscription?.endDate > new Date();

  return { ...user, isPremium };
};

import { db } from '../../database';
import { trainer_messages } from '../../database/schema/trainer_messages.schema';
import { and, eq } from 'drizzle-orm';
import { CreateTrainerMessageDto, NewTrainerMessage } from './types/trainer-messages.type';
import { asc } from 'drizzle-orm';
import { users } from '../../database/schema/users.schema';
import { trainers } from '../../database/schema/trainers.schema';

export const createTrainerMessage = async (data: NewTrainerMessage) => {
  const [newMessage] = await db.insert(trainer_messages).values(data).returning();
  return newMessage;
};

export const getTrainerMessages = async (user_id: string, trainer_id: string) => {
  const messages = await db
    .select()
    .from(trainer_messages)
    .where(and(eq(trainer_messages.user_id, user_id), eq(trainer_messages.trainer_id, trainer_id)))
    .orderBy(asc(trainer_messages.sent_at));

  return messages;
};

export const getUserRole = async (userId: string) => {
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
  return user;
};

export const getTrainerIdByUserId = async (userId: string) => {
  const [trainer] = await db
    .select({ id: trainers.id })
    .from(trainers)
    .where(eq(trainers.userId, userId));
  return trainer;
};

export const getTrainerChatList = async (trainerId: string) => {
  const result = await db
    .selectDistinct({ userId: trainer_messages.user_id })
    .from(trainer_messages)
    .where(eq(trainer_messages.trainer_id, trainerId));
  return result.map(r => r.userId);
};

export const getUserChatList = async (userId: string) => {
  const result = await db
    .selectDistinct({ trainerId: trainer_messages.trainer_id })
    .from(trainer_messages)
    .where(eq(trainer_messages.user_id, userId));
  return result.map(r => r.trainerId);
};

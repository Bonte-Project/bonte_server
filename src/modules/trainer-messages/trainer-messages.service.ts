import { appEmitter } from '../../shared/utils/event.util';
import { Request, Response } from 'express';
import { db } from '../../database';
import { trainer_messages } from '../../database/schema/trainer_messages.schema';
import { and, eq } from 'drizzle-orm';
import { NewTrainerMessage, TrainerMessage } from './types/trainer-messages.type';
import { asc } from 'drizzle-orm';
import { users } from '../../database/schema/users.schema';
import { trainers } from '../../database/schema/trainers.schema';

export const createTrainerMessage = async (data: NewTrainerMessage) => {
  const [newMessage] = await db.insert(trainer_messages).values(data).returning();

  if (newMessage) {
    let recipientUserId: string | undefined;

    if (data.to_from === false) {
      // Trainer to User
      recipientUserId = data.user_id;
    } else {
      // User to Trainer
      const trainerUser = await getUserIdByTrainerId(data.trainer_id);
      recipientUserId = trainerUser?.userId;
    }

    if (recipientUserId) {
      appEmitter.emit(`newMessage:${recipientUserId}`, newMessage);
    }
  }

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

export const getUserIdByTrainerId = async (trainerId: string) => {
  const [trainer] = await db
    .select({ userId: trainers.userId })
    .from(trainers)
    .where(eq(trainers.id, trainerId));
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

export const pollNewMessages = (userId: string, req: Request, res: Response) => {
  const eventName = `newMessage:${userId}`;

  const onMessage = (message: TrainerMessage) => {
    clearTimeout(timer);
    if (!res.headersSent) {
      res.status(200).json(message);
    }
  };

  appEmitter.once(eventName, onMessage);

  const timer = setTimeout(() => {
    appEmitter.removeListener(eventName, onMessage);
    if (!res.headersSent) {
      res.status(204).send();
    }
  }, 120000); // timeout time

  req.on('close', () => {
    clearTimeout(timer);
    appEmitter.removeListener(eventName, onMessage);
  });
};

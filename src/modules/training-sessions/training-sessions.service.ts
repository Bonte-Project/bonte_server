import { db } from '../../database';
import { training_sessions } from '../../database/schema/training_sessions.schema';
import { trainers } from '../../database/schema/trainers.schema';
import { and, eq } from 'drizzle-orm';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from './types/training-sessions.type';

const processDate = (date: Date | string | number) => {
  if (typeof date === 'string' || typeof date === 'number') {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      throw new Error('Invalid date value');
    }
    return newDate;
  }
  if (date instanceof Date) {
    return date;
  }
  throw new Error('Invalid date format');
};

export const createTrainingSession = async (
  authenticatedUserId: string,
  data: CreateTrainingSessionDto
) => {
  const trainerResult = await db
    .select()
    .from(trainers)
    .where(eq(trainers.userId, authenticatedUserId))
    .limit(1);

  if (trainerResult.length === 0) {
    throw new Error('Authenticated user is not a trainer');
  }
  const trainer = trainerResult[0];

  const { userId, scheduledAt, ...rest } = data;

  const processedData = {
    ...rest,
    userId,
    trainerId: trainer.id,
    scheduledAt: processDate(scheduledAt),
  };

  const [newSession] = await db.insert(training_sessions).values(processedData).returning();
  return newSession;
};

export const getTrainingSessions = async (userId: string) => {
  const sessions = await db
    .select()
    .from(training_sessions)
    .where(eq(training_sessions.userId, userId));
  return sessions;
};

export const getTrainingSessionsByTrainer = async (trainerId: string) => {
  const sessions = await db
    .select()
    .from(training_sessions)
    .where(eq(training_sessions.trainerId, trainerId));
  return sessions;
};

export const updateTrainingSession = async (
  authenticatedUserId: string,
  sessionId: string,
  data: UpdateTrainingSessionDto
) => {
  const { scheduledAt, ...rest } = data;
  const processedData: Record<string, any> = { ...rest };

  const trainerResult = await db
    .select()
    .from(trainers)
    .where(eq(trainers.userId, authenticatedUserId))
    .limit(1);

  if (trainerResult.length === 0) {
    throw new Error('Authenticated user is not a trainer');
  }
  const trainer = trainerResult[0];

  if (scheduledAt !== undefined) {
    processedData.scheduledAt = processDate(scheduledAt);
  }

  const [updatedSession] = await db
    .update(training_sessions)
    .set(processedData)
    .where(and(eq(training_sessions.id, sessionId), eq(training_sessions.trainerId, trainer.id)))
    .returning();
  return updatedSession;
};

export const deleteTrainingSession = async (authenticatedUserId: string, sessionId: string) => {
  const trainerResult = await db
    .select()
    .from(trainers)
    .where(eq(trainers.userId, authenticatedUserId))
    .limit(1);

  if (trainerResult.length === 0) {
    throw new Error('Authenticated user is not a trainer');
  }
  const trainer = trainerResult[0];

  const [deletedSession] = await db
    .delete(training_sessions)
    .where(and(eq(training_sessions.id, sessionId), eq(training_sessions.trainerId, trainer.id)))
    .returning();
  return deletedSession;
};

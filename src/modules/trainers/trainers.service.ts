import { db } from '../../database';
import { trainers } from '../../database/schema/trainers.schema';
import { trainerExperience } from '../../database/schema/trainers_experience.schema';
import { and, eq } from 'drizzle-orm';
import {
  CreateTrainerExperienceDto,
  CreateTrainerProfileDto,
  UpdateTrainerExperienceDto,
  UpdateTrainerProfileDto,
} from './types/trainers.type';
import { users } from '../../database/schema/users.schema';

export const createTrainerProfile = async (userId: string, data: CreateTrainerProfileDto) => {
  const { experience, ...trainerData } = data;

  const newTrainer = await db.transaction(async tx => {
    const [trainer] = await tx
      .insert(trainers)
      .values({ ...trainerData, userId })
      .returning();

    if (experience && experience.length > 0) {
      const experienceValues = experience.map(exp => ({ ...exp, trainerId: trainer.id }));
      await tx.insert(trainerExperience).values(experienceValues);
    }
    await tx.update(users).set({ role: 'trainer' }).where(eq(users.id, userId));

    return trainer;
  });

  return newTrainer;
};

export const updateTrainerProfile = async (userId: string, data: UpdateTrainerProfileDto) => {
  const [updatedTrainer] = await db
    .update(trainers)
    .set(data)
    .where(eq(trainers.userId, userId))
    .returning();

  return updatedTrainer;
};

export const getTrainerProfileByUser = async (userId: string) => {
  const trainerProfile = await db
    .select()
    .from(trainers)
    .where(eq(trainers.userId, userId))
    .leftJoin(trainerExperience, eq(trainers.id, trainerExperience.trainerId));

  if (trainerProfile.length === 0) {
    return null;
  }

  const { trainers: trainer } = trainerProfile[0];

  const experience = trainerProfile.map(row => row.trainer_experience).filter(Boolean);

  return { ...trainer, experience };
};

export const getFullTrainerProfile = async (trainerId: string) => {
  const trainerProfile = await db
    .select()
    .from(trainers)
    .where(eq(trainers.id, trainerId))
    .leftJoin(trainerExperience, eq(trainers.id, trainerExperience.trainerId));

  if (trainerProfile.length === 0) {
    return null;
  }

  const { trainers: trainer } = trainerProfile[0];

  const experience = trainerProfile.map(row => row.trainer_experience).filter(Boolean);

  return { ...trainer, experience };
};

export const addTrainerExperience = async (userId: string, data: CreateTrainerExperienceDto) => {
  const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
  if (!trainer) {
    throw new Error('Trainer not found');
  }

  const [newExperience] = await db
    .insert(trainerExperience)
    .values({ ...data, trainerId: trainer.id })
    .returning();

  return newExperience;
};

export const updateTrainerExperience = async (
  userId: string,
  experienceId: string,
  data: UpdateTrainerExperienceDto
) => {
  const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
  if (!trainer) {
    throw new Error('Trainer not found');
  }

  const [updatedExperience] = await db
    .update(trainerExperience)
    .set(data)
    .where(and(eq(trainerExperience.id, experienceId), eq(trainerExperience.trainerId, trainer.id)))
    .returning();

  return updatedExperience;
};

export const deleteTrainerExperience = async (userId: string, experienceId: string) => {
  const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
  if (!trainer) {
    throw new Error('Trainer not found');
  }

  await db
    .delete(trainerExperience)
    .where(
      and(eq(trainerExperience.id, experienceId), eq(trainerExperience.trainerId, trainer.id))
    );
};

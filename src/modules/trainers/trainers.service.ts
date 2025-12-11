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

const processDate = (date: Date | number | undefined | null): Date | undefined => {
  if (date === null || date === undefined) {
    return undefined;
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

export const createTrainerProfile = async (userId: string, data: CreateTrainerProfileDto) => {
  const { experience, ...trainerData } = data;

  const newTrainer = await db.transaction(async tx => {
    const [trainer] = await tx
      .insert(trainers)
      .values({ ...trainerData, userId })
      .returning();

    if (experience && experience.length > 0) {
      const experienceValues = experience.map(exp => ({
        ...exp,
        trainerId: trainer.id,
        startDate: processDate(exp.startDate),
        endDate: processDate(exp.endDate),
      }));
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

export const getAllTrainers = async () => {
  const allTrainers = await db
    .select()
    .from(trainers)
    .leftJoin(trainerExperience, eq(trainers.id, trainerExperience.trainerId));

  const trainersMap: Record<
    string,
    { trainer: typeof trainers.$inferSelect; experience: (typeof trainerExperience.$inferSelect)[] }
  > = {};

  for (const row of allTrainers) {
    const trainerId = row.trainers.id;
    if (!trainersMap[trainerId]) {
      trainersMap[trainerId] = {
        trainer: row.trainers,
        experience: [],
      };
    }
    if (row.trainer_experience) {
      trainersMap[trainerId].experience.push(row.trainer_experience);
    }
  }

  return Object.values(trainersMap).map(({ trainer, experience }) => ({
    ...trainer,
    experience,
  }));
};

export const addTrainerExperience = async (userId: string, data: CreateTrainerExperienceDto) => {
  const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
  if (!trainer) {
    throw new Error('Trainer not found');
  }

  const experienceData = {
    ...data,
    startDate: processDate(data.startDate),
    endDate: processDate(data.endDate),
  };

  const [newExperience] = await db
    .insert(trainerExperience)
    .values({ ...experienceData, trainerId: trainer.id })
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

  const experienceData: Record<string, unknown> = { ...data };

  if (data.startDate) {
    experienceData.startDate = processDate(data.startDate);
  }
  if (data.endDate) {
    experienceData.endDate = processDate(data.endDate);
  }

  const [updatedExperience] = await db
    .update(trainerExperience)
    .set(experienceData)
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

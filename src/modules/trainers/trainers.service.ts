import { db } from '../../database';
import { trainers } from '../../database/schema/trainers.schema';
import { trainerExperience } from '../../database/schema/trainers_experience.schema';
import { eq } from 'drizzle-orm';
import { CreateTrainerProfileDto, UpdateTrainerProfileDto } from './types/trainers.type';
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
  const { experience, ...trainerData } = data;

  const updatedTrainer = await db.transaction(async tx => {
    const [trainer] = await tx
      .update(trainers)
      .set(trainerData)
      .where(eq(trainers.userId, userId))
      .returning();

    if (experience) {
      await tx.delete(trainerExperience).where(eq(trainerExperience.trainerId, trainer.id));
      const experienceValues = experience.map(exp => ({ ...exp, trainerId: trainer.id }));
      await tx.insert(trainerExperience).values(experienceValues);
    }

    return trainer;
  });

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

  const [baseTrainer] = trainerProfile;
  const { trainer_experience, ...trainer } = baseTrainer;

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

  const [baseTrainer] = trainerProfile;
  const { trainer_experience, ...trainer } = baseTrainer;

  const experience = trainerProfile.map(row => row.trainer_experience).filter(Boolean);

  return { ...trainer, experience };
};

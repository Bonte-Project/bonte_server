import { trainers } from '../../../database/schema/trainers.schema';
import { trainerExperience } from '../../../database/schema/trainers_experience.schema';

export type Trainer = typeof trainers.$inferSelect;
export type TrainerExperience = typeof trainerExperience.$inferSelect;

export type CreateTrainerProfileDto = Omit<Trainer, 'id' | 'userId'> & {
  experience?: Omit<TrainerExperience, 'id' | 'trainerId'>[];
};

export type UpdateTrainerProfileDto = Partial<Omit<CreateTrainerProfileDto, 'experience'>>;

export type CreateTrainerExperienceDto = Omit<TrainerExperience, 'id' | 'trainerId'>;
export type UpdateTrainerExperienceDto = Partial<CreateTrainerExperienceDto>;

export type FullTrainerProfile = Trainer & {
  experience: TrainerExperience[];
};

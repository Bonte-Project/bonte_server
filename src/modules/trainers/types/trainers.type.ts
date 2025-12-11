import { trainers } from '../../../database/schema/trainers.schema';
import { trainerExperience } from '../../../database/schema/trainers_experience.schema';

export type Trainer = typeof trainers.$inferSelect;
export type TrainerExperience = typeof trainerExperience.$inferSelect;

type TrainerExperienceDto = Omit<
  TrainerExperience,
  'id' | 'trainerId' | 'startDate' | 'endDate'
> & {
  startDate?: Date | number | null;
  endDate?: Date | number | null;
};

export type CreateTrainerProfileDto = Omit<Trainer, 'id' | 'userId'> & {
  experience?: TrainerExperienceDto[];
};

export type UpdateTrainerProfileDto = Partial<Omit<CreateTrainerProfileDto, 'experience'>>;

export type CreateTrainerExperienceDto = TrainerExperienceDto;
export type UpdateTrainerExperienceDto = Partial<TrainerExperienceDto>;

export type FullTrainerProfile = Trainer & {
  experience: TrainerExperience[];
};

import { training_sessions } from '../../../database/schema/training_sessions.schema';

export type TrainingSession = typeof training_sessions.$inferSelect;
export type NewTrainingSession = typeof training_sessions.$inferInsert;

export type CreateTrainingSessionDto = {
  name: string;
  userId: string;
  scheduledAt: Date | number | string;
};

export type UpdateTrainingSessionDto = {
  name?: string;
  trainerId?: string;
  scheduledAt: Date | number | string;
  status?: 'scheduled' | 'completed' | 'cancelled';
};

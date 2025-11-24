import { trainer_messages } from '../../../database/schema/trainer_messages.schema';

export type TrainerMessage = typeof trainer_messages.$inferSelect;
export type NewTrainerMessage = typeof trainer_messages.$inferInsert;

export type CreateTrainerMessageDto = {
  message: string;
  to_from: boolean;
};

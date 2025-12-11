import { ExpressHandler } from '../../shared/types/express.type';
import {
  createTrainingSession,
  deleteTrainingSession,
  getTrainingSessions,
  getTrainingSessionsByTrainer,
  updateTrainingSession,
} from './training-sessions.service';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from './types/training-sessions.type';
import { db } from '../../database';
import { trainers } from '../../database/schema/trainers.schema';
import { eq } from 'drizzle-orm';

export const createTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;

    if (!authenticatedUserId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const session = await createTrainingSession(
      authenticatedUserId,
      req.body as CreateTrainingSessionDto
    );

    res.status(201).json({
      message: 'Training session created successfully',
      session,
    });
  } catch (error) {
    console.error('Error in createTrainingSessionHandler:', error);
    if (error instanceof Error && error.message === 'Authenticated user is not a trainer') {
      res.status(403).json({ message: 'Forbidden: Authenticated user is not a trainer' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainingSessionsHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const sessions = await getTrainingSessions(userId);

    res.status(200).json({
      message: 'Training sessions fetched successfully',
      sessions,
    });
  } catch (error) {
    console.error('Error in getTrainingSessionsHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainingSessionsByTrainerHandler: ExpressHandler = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;

    if (!authenticatedUserId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const trainerResult = await db
      .select()
      .from(trainers)
      .where(eq(trainers.userId, authenticatedUserId))
      .limit(1);

    if (trainerResult.length === 0) {
      res.status(403).json({ message: 'Forbidden: Authenticated user is not a trainer' });
      return;
    }
    const trainer = trainerResult[0];

    const sessions = await getTrainingSessionsByTrainer(trainer.id);

    res.status(200).json({
      message: 'Training sessions for trainer fetched successfully',
      sessions,
    });
  } catch (error) {
    console.error('Error in getTrainingSessionsByTrainerHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainingSessionsByTrainerIdHandler: ExpressHandler = async (req, res) => {
  try {
    const trainerId = req.params.trainerId;

    const sessions = await getTrainingSessionsByTrainer(trainerId);

    res.status(200).json({
      message: 'Training sessions for trainer fetched successfully',
      sessions,
    });
  } catch (error) {
    console.error('Error in getTrainingSessionsByTrainerIdHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const sessionId = req.params.id;

    if (!authenticatedUserId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedSession = await updateTrainingSession(
      authenticatedUserId,
      sessionId,
      req.body as UpdateTrainingSessionDto
    );

    if (!updatedSession) {
      res.status(404).json({ message: 'Training session not found or user is not the trainer' });
      return;
    }

    res.status(200).json({
      message: 'Training session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error in updateTrainingSessionHandler:', error);
    if (error instanceof Error && error.message === 'Authenticated user is not a trainer') {
      res.status(403).json({ message: 'Forbidden: Authenticated user is not a trainer' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const sessionId = req.params.id;

    if (!authenticatedUserId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedSession = await deleteTrainingSession(authenticatedUserId, sessionId);

    if (!deletedSession) {
      res.status(404).json({ message: 'Training session not found or user is not the trainer' });
      return;
    }

    res.status(200).json({
      message: 'Training session deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTrainingSessionHandler:', error);
    if (error instanceof Error && error.message === 'Authenticated user is not a trainer') {
      res.status(403).json({ message: 'Forbidden: Authenticated user is not a trainer' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

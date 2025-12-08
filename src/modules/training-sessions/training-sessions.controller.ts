import { ExpressHandler } from '../../shared/types/express.type';
import {
  createTrainingSession,
  deleteTrainingSession,
  getTrainingSessions,
  getTrainingSessionsByTrainer,
  updateTrainingSession,
} from './training-sessions.service';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from './types/training-sessions.type';

export const createTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const authenticatedTrainerId = req.user?.userId;

    if (!authenticatedTrainerId) {
      res.status(401).json({ message: 'Unauthorized: Trainer ID not found' });
      return;
    }

    const session = await createTrainingSession(
      authenticatedTrainerId,
      req.body as CreateTrainingSessionDto
    );

    res.status(201).json({
      message: 'Training session created successfully',
      session,
    });
  } catch (error) {
    console.error('Error in createTrainingSessionHandler:', error);
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
    const trainerId = req.user?.userId;

    if (!trainerId) {
      res.status(401).json({ message: 'Unauthorized: Trainer ID not found' });
      return;
    }

    const sessions = await getTrainingSessionsByTrainer(trainerId);

    res.status(200).json({
      message: 'Training sessions for trainer fetched successfully',
      sessions,
    });
  } catch (error) {
    console.error('Error in getTrainingSessionsByTrainerHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedSession = await updateTrainingSession(
      userId,
      sessionId,
      req.body as UpdateTrainingSessionDto
    );

    if (!updatedSession) {
      res.status(404).json({ message: 'Training session not found' });
      return;
    }

    res.status(200).json({
      message: 'Training session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error in updateTrainingSessionHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrainingSessionHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedSession = await deleteTrainingSession(userId, sessionId);

    if (!deletedSession) {
      res.status(404).json({ message: 'Training session not found' });
      return;
    }

    res.status(200).json({
      message: 'Training session deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTrainingSessionHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

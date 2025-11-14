import { ExpressHandler } from '../../shared/types/express.type';
import {
  createTrainerProfile as createTrainerProfileService,
  updateTrainerProfile as updateTrainerProfileService,
  getTrainerProfileByUser as getTrainerProfileByUserService,
  getFullTrainerProfile as getFullTrainerProfileService,
} from './trainers.service';
import { CreateTrainerProfileDto, UpdateTrainerProfileDto } from './types/trainers.type';

export const createTrainerProfile: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const newTrainer = await createTrainerProfileService(
      userId,
      req.body as CreateTrainerProfileDto
    );

    res.status(201).json({
      message: 'Trainer profile created successfully',
      trainer: newTrainer,
    });
  } catch (error) {
    console.error('Error in createTrainerProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrainerProfile: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedTrainer = await updateTrainerProfileService(
      userId,
      req.body as UpdateTrainerProfileDto
    );

    res.status(200).json({
      message: 'Trainer profile updated successfully',
      trainer: updatedTrainer,
    });
  } catch (error) {
    console.error('Error in updateTrainerProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyTrainerProfile: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const trainerProfile = await getTrainerProfileByUserService(userId);

    if (!trainerProfile) {
      res.status(404).json({ message: 'Trainer profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Trainer profile fetched successfully',
      trainer: trainerProfile,
    });
  } catch (error) {
    console.error('Error in getMyTrainerProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainerProfile: ExpressHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const trainerProfile = await getFullTrainerProfileService(id);

    if (!trainerProfile) {
      res.status(404).json({ message: 'Trainer profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Trainer profile fetched successfully',
      trainer: trainerProfile,
    });
  } catch (error) {
    console.error('Error in getTrainerProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

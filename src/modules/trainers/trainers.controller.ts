import { ExpressHandler } from '../../shared/types/express.type';
import {
  addTrainerExperience as addTrainerExperienceService,
  createTrainerProfile as createTrainerProfileService,
  deleteTrainerExperience as deleteTrainerExperienceService,
  getFullTrainerProfile as getFullTrainerProfileService,
  getTrainerProfileByUser as getTrainerProfileByUserService,
  updateTrainerExperience as updateTrainerExperienceService,
  updateTrainerProfile as updateTrainerProfileService,
  getAllTrainers as getAllTrainersService,
} from './trainers.service';
import {
  CreateTrainerExperienceDto,
  CreateTrainerProfileDto,
  UpdateTrainerExperienceDto,
  UpdateTrainerProfileDto,
} from './types/trainers.type';

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

export const getAllTrainers: ExpressHandler = async (req, res) => {
  try {
    const trainers = await getAllTrainersService();
    res.status(200).json({
      message: 'Trainers fetched successfully',
      trainers,
    });
  } catch (error) {
    console.error('Error in getAllTrainers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addTrainerExperience: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const newExperience = await addTrainerExperienceService(
      userId,
      req.body as CreateTrainerExperienceDto
    );

    res.status(201).json({
      message: 'Trainer experience added successfully',
      experience: newExperience,
    });
  } catch (error) {
    console.error('Error in addTrainerExperience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrainerExperience: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { experienceId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedExperience = await updateTrainerExperienceService(
      userId,
      experienceId,
      req.body as UpdateTrainerExperienceDto
    );

    res.status(200).json({
      message: 'Trainer experience updated successfully',
      experience: updatedExperience,
    });
  } catch (error) {
    console.error('Error in updateTrainerExperience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrainerExperience: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { experienceId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    await deleteTrainerExperienceService(userId, experienceId);

    res.status(200).json({ message: 'Trainer experience deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTrainerExperience:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

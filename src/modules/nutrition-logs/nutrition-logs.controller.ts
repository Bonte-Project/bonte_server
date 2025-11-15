import { ExpressHandler } from '../../shared/types/express.type';
import {
  createNutritionLog,
  deleteNutritionLog,
  getNutritionLogs,
  getNutritionLogsByPeriod,
  updateNutritionLog,
} from './nutrition-logs.service';
import { CreateNutritionLogDto, UpdateNutritionLogDto } from './types/nutrition-logs.type';

export const createNutritionLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const log = await createNutritionLog(userId, req.body as CreateNutritionLogDto);

    res.status(201).json({
      message: 'Nutrition log created successfully',
      log,
    });
  } catch (error) {
    console.error('Error in createNutritionLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNutritionLogsHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const logs = await getNutritionLogs(userId);

    res.status(200).json({
      message: 'Nutrition logs fetched successfully',
      logs,
    });
  } catch (error) {
    console.error('Error in getNutritionLogsHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNutritionLogsByPeriodHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { date } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    if (!date) {
      res.status(400).json({ message: 'Date query parameter is required' });
      return;
    }

    const logs = await getNutritionLogsByPeriod(userId, date as string);

    res.status(200).json({
      message: 'Nutrition logs fetched successfully for the period',
      logs,
    });
  } catch (error) {
    console.error('Error in getNutritionLogsByPeriodHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateNutritionLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedLog = await updateNutritionLog(userId, logId, req.body as UpdateNutritionLogDto);

    if (!updatedLog) {
      res.status(404).json({ message: 'Nutrition log not found' });
      return;
    }

    res.status(200).json({
      message: 'Nutrition log updated successfully',
      log: updatedLog,
    });
  } catch (error) {
    console.error('Error in updateNutritionLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNutritionLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedLog = await deleteNutritionLog(userId, logId);

    if (!deletedLog) {
      res.status(404).json({ message: 'Nutrition log not found' });
      return;
    }

    res.status(200).json({
      message: 'Nutrition log deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteNutritionLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

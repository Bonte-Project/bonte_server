import { ExpressHandler } from '../../shared/types/express.type';
import {
  createActivityLog,
  deleteActivityLog,
  getActivityLogs,
  getActivityLogsByPeriod,
  updateActivityLog,
} from './activity-logs.service';
import { CreateActivityLogDto, UpdateActivityLogDto } from './types/activity-logs.type';

export const createActivityLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const log = await createActivityLog(userId, req.body as CreateActivityLogDto);

    res.status(201).json({
      message: 'Activity log created successfully',
      log,
    });
  } catch (error) {
    console.error('Error in createActivityLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getActivityLogsHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const logs = await getActivityLogs(userId);

    res.status(200).json({
      message: 'Activity logs fetched successfully',
      logs,
    });
  } catch (error) {
    console.error('Error in getActivityLogsHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getActivityLogsByPeriodHandler: ExpressHandler = async (req, res) => {
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

    const logs = await getActivityLogsByPeriod(userId, date as string);

    res.status(200).json({
      message: 'Activity logs fetched successfully for the period',
      logs,
    });
  } catch (error) {
    console.error('Error in getActivityLogsByPeriodHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateActivityLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedLog = await updateActivityLog(userId, logId, req.body as UpdateActivityLogDto);

    if (!updatedLog) {
      res.status(404).json({ message: 'Activity log not found' });
      return;
    }

    res.status(200).json({
      message: 'Activity log updated successfully',
      log: updatedLog,
    });
  } catch (error) {
    console.error('Error in updateActivityLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteActivityLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedLog = await deleteActivityLog(userId, logId);

    if (!deletedLog) {
      res.status(404).json({ message: 'Activity log not found' });
      return;
    }

    res.status(200).json({
      message: 'Activity log deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteActivityLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

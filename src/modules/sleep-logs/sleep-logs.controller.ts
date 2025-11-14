import { ExpressHandler } from '../../shared/types/express.type';
import { createSleepLog, deleteSleepLog, getSleepLogs, updateSleepLog } from './sleep-logs.service';
import { CreateSleepLogDto, UpdateSleepLogDto } from './types/sleep-logs.type';

export const createSleepLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const log = await createSleepLog(userId, req.body as CreateSleepLogDto);

    res.status(201).json({
      message: 'Sleep log created successfully',
      log,
    });
  } catch (error) {
    console.error('Error in createSleepLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSleepLogsHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const logs = await getSleepLogs(userId);

    res.status(200).json({
      message: 'Sleep logs fetched successfully',
      logs,
    });
  } catch (error) {
    console.error('Error in getSleepLogsHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSleepLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedLog = await updateSleepLog(userId, logId, req.body as UpdateSleepLogDto);

    if (!updatedLog) {
      res.status(404).json({ message: 'Sleep log not found' });
      return;
    }

    res.status(200).json({
      message: 'Sleep log updated successfully',
      log: updatedLog,
    });
  } catch (error) {
    console.error('Error in updateSleepLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSleepLogHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedLog = await deleteSleepLog(userId, logId);

    if (!deletedLog) {
      res.status(404).json({ message: 'Sleep log not found' });
      return;
    }

    res.status(200).json({
      message: 'Sleep log deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteSleepLogHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

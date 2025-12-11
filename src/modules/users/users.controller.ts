import { ExpressHandler } from '../../shared/types/express.type';
import {
  getMe as getMeService,
  updateMe as updateMeService,
  getUserById as getUserByIdService,
} from './users.service';
import { UpdateUserDto } from './types/users.type';

export const me: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const user = await getMeService(userId);

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'User data fetched successfully',
      user,
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMe: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const updatedUser = await updateMeService(userId, req.body as UpdateUserDto);

    res.status(200).json({
      message: 'User data updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateMe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById: ExpressHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User data fetched successfully',
      user,
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

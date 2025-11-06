import { ExpressHandler } from '../../shared/types/express.type';

export const me: ExpressHandler = (req, res) => {
  try {
    const user = req.user;

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

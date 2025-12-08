import { Response, NextFunction } from 'express';
import { db } from '../../database';
import { trainers } from '../../database/schema/trainers.schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from './auth.middleware';

export const trainerAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const trainerResult = await db
      .select()
      .from(trainers)
      .where(eq(trainers.userId, userId))
      .limit(1);

    if (trainerResult.length === 0) {
      res.status(403).json({ message: 'Access forbidden: user is not a trainer' });
      return;
    }

    next();
  } catch (error) {
    console.error('Trainer auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

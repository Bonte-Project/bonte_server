import { ExpressHandler } from '../../shared/types/express.type';
import {
  upsertNutritionGoal,
  getNutritionGoal,
  deleteNutritionGoal,
} from './nutrition-goals.service';
import { CreateNutritionGoalDto } from './types/nutrition-goals.type';

export const upsertNutritionGoalHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const goal = await upsertNutritionGoal(userId, req.body as CreateNutritionGoalDto);

    res.status(200).json({
      message: 'Nutrition goal saved successfully',
      goal,
    });
  } catch (error) {
    console.error('Error in upsertNutritionGoalHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNutritionGoalHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const goal = await getNutritionGoal(userId);

    if (!goal) {
      res.status(404).json({ message: 'Nutrition goal not found' });
      return;
    }

    res.status(200).json({
      message: 'Nutrition goal fetched successfully',
      goal,
    });
  } catch (error) {
    console.error('Error in getNutritionGoalHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNutritionGoalHandler: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const deletedGoal = await deleteNutritionGoal(userId);

    if (!deletedGoal) {
      res.status(404).json({ message: 'Nutrition goal not found' });
      return;
    }

    res.status(200).json({
      message: 'Nutrition goal deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteNutritionGoalHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

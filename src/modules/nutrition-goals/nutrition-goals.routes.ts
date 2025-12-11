import { Router } from 'express';
import {
  upsertNutritionGoalHandler,
  getNutritionGoalHandler,
  deleteNutritionGoalHandler,
} from './nutrition-goals.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NutritionGoal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: string
 *           format: uuid
 *         calories:
 *           type: integer
 *         protein:
 *           type: integer
 *         fat:
 *           type: integer
 *         carbs:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateNutritionGoalDto:
 *       type: object
 *       required:
 *         - calories
 *         - protein
 *         - fat
 *         - carbs
 *       properties:
 *         calories:
 *           type: integer
 *         protein:
 *           type: integer
 *         fat:
 *           type: integer
 *         carbs:
 *           type: integer
 */

/**
 * @swagger
 * /nutrition-goals:
 *   get:
 *     summary: Get the nutrition goal for the current user
 *     description: Returns the nutrition goal for the user associated with the provided access token
 *     tags:
 *       - Nutrition Goals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition goal fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition goal fetched successfully
 *                 goal:
 *                   $ref: '#/components/schemas/NutritionGoal'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Nutrition goal not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, getNutritionGoalHandler);

/**
 * @swagger
 * /nutrition-goals:
 *   post:
 *     summary: Create or update a nutrition goal
 *     description: Creates or updates the nutrition goal for the user associated with the provided access token
 *     tags:
 *       - Nutrition Goals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNutritionGoalDto'
 *     responses:
 *       200:
 *         description: Nutrition goal saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition goal saved successfully
 *                 goal:
 *                   $ref: '#/components/schemas/NutritionGoal'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, upsertNutritionGoalHandler);

/**
 * @swagger
 * /nutrition-goals:
 *   delete:
 *     summary: Delete the nutrition goal
 *     description: Deletes the nutrition goal for the user associated with the provided access token
 *     tags:
 *       - Nutrition Goals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition goal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition goal deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Nutrition goal not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/', authMiddleware, deleteNutritionGoalHandler);

export default router;

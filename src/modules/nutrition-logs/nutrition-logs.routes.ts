import { Router } from 'express';
import {
  createNutritionLogHandler,
  deleteNutritionLogHandler,
  getNutritionLogsByPeriodHandler,
  getNutritionLogsHandler,
  updateNutritionLogHandler,
} from './nutrition-logs.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NutritionLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         eatenAt:
 *           type: string
 *           format: date-time
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         name:
 *           type: string
 *         calories:
 *           type: integer
 *         protein:
 *           type: integer
 *         carbs:
 *           type: integer
 *         fat:
 *           type: integer
 *         weightInGrams:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateNutritionLogDto:
 *       type: object
 *       required:
 *         - eatenAt
 *         - mealType
 *         - name
 *         - calories
 *       properties:
 *         eatenAt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         name:
 *           type: string
 *         calories:
 *           type: integer
 *         protein:
 *           type: integer
 *         carbs:
 *           type: integer
 *         fat:
 *           type: integer
 *         weightInGrams:
 *           type: integer
 *     UpdateNutritionLogDto:
 *       type: object
 *       properties:
 *         eatenAt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         name:
 *           type: string
 *         calories:
 *           type: integer
 *         protein:
 *           type: integer
 *         carbs:
 *           type: integer
 *         fat:
 *           type: integer
 *         weightInGrams:
 *           type: integer
 */

/**
 * @swagger
 * /nutrition-logs:
 *   get:
 *     summary: Get all nutrition logs for the current user
 *     description: Returns all nutrition logs for the user associated with the provided access token
 *     tags:
 *       - Nutrition Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition logs fetched successfully
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NutritionLog'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, getNutritionLogsHandler);

/**
 * @swagger
 * /nutrition-logs/period:
 *   get:
 *     summary: Get nutrition logs for a 30-day period
 *     description: Returns nutrition logs for the user for a 30-day period ending on the specified date.
 *     tags:
 *       - Nutrition Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         description: The end date of the 30-day period. Can be a date-time string or a timestamp.
 *     responses:
 *       200:
 *         description: Nutrition logs fetched successfully for the period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition logs fetched successfully for the period
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NutritionLog'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/period', authMiddleware, getNutritionLogsByPeriodHandler);

/**
 * @swagger
 * /nutrition-logs:
 *   post:
 *     summary: Create a new nutrition log
 *     description: Creates a new nutrition log for the user associated with the provided access token
 *     tags:
 *       - Nutrition Logs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNutritionLogDto'
 *     responses:
 *       201:
 *         description: Nutrition log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition log created successfully
 *                 log:
 *                   $ref: '#/components/schemas/NutritionLog'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, createNutritionLogHandler);

/**
 * @swagger
 * /nutrition-logs/{id}:
 *   patch:
 *     summary: Update a nutrition log
 *     description: Updates a nutrition log for the user associated with the provided access token
 *     tags:
 *       - Nutrition Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNutritionLogDto'
 *     responses:
 *       200:
 *         description: Nutrition log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition log updated successfully
 *                 log:
 *                   $ref: '#/components/schemas/NutritionLog'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Nutrition log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware, updateNutritionLogHandler);

/**
 * @swagger
 * /nutrition-logs/{id}:
 *   delete:
 *     summary: Delete a nutrition log
 *     description: Deletes a nutrition log for the user associated with the provided access token
 *     tags:
 *       - Nutrition Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Nutrition log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition log deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Nutrition log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware, deleteNutritionLogHandler);

export default router;

import { Router } from 'express';
import {
  createTrainingSessionHandler,
  deleteTrainingSessionHandler,
  getTrainingSessionsByTrainerHandler,
  getTrainingSessionsHandler,
  updateTrainingSessionHandler,
} from './training-sessions.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { trainerAuthMiddleware } from '../../shared/middlewares/trainer.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TrainingSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *         trainerId:
 *           type: string
 *           format: uuid
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *     CreateTrainingSessionDto:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *         - scheduledAt
 *       properties:
 *         name:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *         scheduledAt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *     UpdateTrainingSessionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         scheduledAt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 */

/**
 * @swagger
 * /training-sessions:
 *   get:
 *     summary: Get all training sessions for the current user
 *     description: Returns all training sessions for the user associated with the provided access token
 *     tags:
 *       - Training Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training sessions fetched successfully
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrainingSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, getTrainingSessionsHandler);

/**
 * @swagger
 * /training-sessions/trainer:
 *   get:
 *     summary: Get all training sessions for the current trainer
 *     description: Returns all training sessions for the trainer associated with the provided access token (trainer only)
 *     tags:
 *       - Training Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training sessions for trainer fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training sessions for trainer fetched successfully
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrainingSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/trainer', authMiddleware, getTrainingSessionsByTrainerHandler);

/**
 * @swagger
 * /training-sessions:
 *   post:
 *     summary: Create a new training session
 *     description: Creates a new training session (trainer only)
 *     tags:
 *       - Training Sessions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrainingSessionDto'
 *     responses:
 *       201:
 *         description: Training session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training session created successfully
 *                 session:
 *                   $ref: '#/components/schemas/TrainingSession'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, trainerAuthMiddleware, createTrainingSessionHandler);

/**
 * @swagger
 * /training-sessions/{id}:
 *   patch:
 *     summary: Update a training session
 *     description: Updates a training session (trainer only)
 *     tags:
 *       - Training Sessions
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
 *             $ref: '#/components/schemas/UpdateTrainingSessionDto'
 *     responses:
 *       200:
 *         description: Training session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training session updated successfully
 *                 session:
 *                   $ref: '#/components/schemas/TrainingSession'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Training session not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware, trainerAuthMiddleware, updateTrainingSessionHandler);

/**
 * @swagger
 * /training-sessions/{id}:
 *   delete:
 *     summary: Delete a training session
 *     description: Deletes a training session (trainer only)
 *     tags:
 *       - Training Sessions
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
 *         description: Training session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training session deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Training session not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware, trainerAuthMiddleware, deleteTrainingSessionHandler);

export default router;

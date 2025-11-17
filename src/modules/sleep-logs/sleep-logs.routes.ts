import { Router } from 'express';
import {
  createSleepLogHandler,
  deleteSleepLogHandler,
  getSleepLogsByPeriodHandler,
  getSleepLogsHandler,
  updateSleepLogHandler,
} from './sleep-logs.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SleepLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         quality:
 *           type: string
 *           enum: [good, average, poor]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateSleepLogDto:
 *       type: object
 *       required:
 *         - startTime
 *         - endTime
 *         - quality
 *       properties:
 *         startTime:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         endTime:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         quality:
 *           type: string
 *           enum: [good, average, poor]
 *     UpdateSleepLogDto:
 *       type: object
 *       properties:
 *         startTime:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         endTime:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         quality:
 *           type: string
 *           enum: [good, average, poor]
 */

/**
 * @swagger
 * /sleep-logs:
 *   get:
 *     summary: Get all sleep logs for the current user
 *     description: Returns all sleep logs for the user associated with the provided access token
 *     tags:
 *       - Sleep Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sleep logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep logs fetched successfully
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SleepLog'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, getSleepLogsHandler);

/**
 * @swagger
 * /sleep-logs/period:
 *   get:
 *     summary: Get sleep logs for a 30-day period
 *     description: Returns sleep logs for the user for a 30-day period ending on the specified date.
 *     tags:
 *       - Sleep Logs
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
 *         description: Sleep logs fetched successfully for the period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep logs fetched successfully for the period
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SleepLog'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/period', authMiddleware, getSleepLogsByPeriodHandler);

/**
 * @swagger
 * /sleep-logs:
 *   post:
 *     summary: Create a new sleep log
 *     description: Creates a new sleep log for the user associated with the provided access token
 *     tags:
 *       - Sleep Logs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSleepLogDto'
 *     responses:
 *       201:
 *         description: Sleep log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep log created successfully
 *                 log:
 *                   $ref: '#/components/schemas/SleepLog'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, createSleepLogHandler);

/**
 * @swagger
 * /sleep-logs/{id}:
 *   patch:
 *     summary: Update a sleep log
 *     description: Updates a sleep log for the user associated with the provided access token
 *     tags:
 *       - Sleep Logs
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
 *             $ref: '#/components/schemas/UpdateSleepLogDto'
 *     responses:
 *       200:
 *         description: Sleep log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep log updated successfully
 *                 log:
 *                   $ref: '#/components/schemas/SleepLog'
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
 *               message: Sleep log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware, updateSleepLogHandler);

/**
 * @swagger
 * /sleep-logs/{id}:
 *   delete:
 *     summary: Delete a sleep log
 *     description: Deletes a sleep log for the user associated with the provided access token
 *     tags:
 *       - Sleep Logs
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
 *         description: Sleep log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep log deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Sleep log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware, deleteSleepLogHandler);

export default router;
